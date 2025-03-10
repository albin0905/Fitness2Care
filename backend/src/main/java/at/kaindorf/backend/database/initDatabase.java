package at.kaindorf.backend.database;

import at.kaindorf.backend.pojos.Product;
import at.kaindorf.backend.repositorys.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class initDatabase {
    private static final String API_URL = "https://world.openfoodfacts.org/cgi/search.pl?search_terms=&search_simple=1&action=process&json=1&page_size=1000&page=";
    List<Product> productList = new ArrayList<>();

    private final ProductRepository productRepository;

    @PostConstruct
    public void importData(){
        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper objectMapper = new ObjectMapper();
        int page = 1;
        boolean hasMore = true;

        try {
            while (hasMore) {
                String response = restTemplate.getForObject(API_URL + page, String.class);
                JsonNode root = objectMapper.readTree(response);
                JsonNode products = root.path("products");
                int productCount = products.size();

                if (productCount == 0) {
                    hasMore = false;
                    break;
                }

                for (JsonNode node : products) {
                    Long barcode = node.path("code").asLong();
                    String productName = node.path("product_name").asText();
                    Integer kcal_100g = node.path("nutriments").path("energy-kcal_100g").asInt();
                    String originCountry = node.path("countries").asText();

                    String ingredients = node.path("ingredients_text").asText("");

                    Product product = new Product(barcode, productName, kcal_100g, originCountry, ingredients);
                    productList.add(product);
                }

                if (productCount < 5000) {
                    hasMore = false;
                }
                page++;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println(productList.size());
        for (Product product : productList) {
            System.out.println(product.toString());
        }
        productRepository.saveAll(productList);
    }
}
