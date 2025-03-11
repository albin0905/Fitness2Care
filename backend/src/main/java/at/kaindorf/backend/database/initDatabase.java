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
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
@RequiredArgsConstructor
public class initDatabase {
    private static final String API_URL = "https://world.openfoodfacts.org/cgi/search.pl?search_terms=&search_simple=1&action=process&json=1&page_size=1000&page=";
    List<Product> productList = new ArrayList<>();

    private final ProductRepository productRepository;

    // 990 Seiten

    @PostConstruct
    public void importData(){
        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper objectMapper = new ObjectMapper();
        int page = 1;
        int requestCount = 0;

        try {
            while (true) {
                String response = restTemplate.getForObject(API_URL + page, String.class);
                JsonNode root = objectMapper.readTree(response);
                log.info("Page: " + page);
                log.info("Root: " + root.size());
                JsonNode products = root.path("products");
                int productCount = products.size();
                log.info("Products: " + productCount);

                if (productCount == 0) break;

                for (JsonNode node : products) {
                    Long barcode = node.path("code").asLong();
                    String productName = node.path("product_name").asText();
                    Integer kcal_100g = node.path("nutriments").path("energy-kcal_100g").asInt();
                    String originCountry = node.path("countries").asText();
                    String ingredients = node.path("ingredients_text").asText("");

                    if (productName.length() > 255){
                        productName = productName.substring(0,255);
                    }
                    if (originCountry.length() > 255){
                        originCountry = originCountry.substring(0,255);
                    }

                    Product product = new Product(barcode, productName, kcal_100g, originCountry, ingredients);
                    productList.add(product);
                }

                requestCount++;
                if (requestCount % 10 == 0) {
                    log.info("Reached 10 requests, sleeping for 1 minute...");
                    for (Product product : productList) {
                        System.out.println(product.toString());
                    }
                    productRepository.saveAll(productList);
                    productList.clear();
                    TimeUnit.MINUTES.sleep(1);
                }
                page++;
            }
        } catch (InterruptedException e) {
            log.error("Sleep interrupted", e);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Error during data import", e);
        }
    }
}
