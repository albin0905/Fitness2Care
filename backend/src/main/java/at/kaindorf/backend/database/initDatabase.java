package at.kaindorf.backend.database;

import at.kaindorf.backend.pojos.Exercice;
import at.kaindorf.backend.pojos.Member;
import at.kaindorf.backend.pojos.Product;
import at.kaindorf.backend.pojos.Workout;
import at.kaindorf.backend.repositorys.MemberRepository;
import at.kaindorf.backend.repositorys.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
@RequiredArgsConstructor
public class initDatabase implements ApplicationRunner {
    private static final String API_URL = "https://world.openfoodfacts.org/cgi/search.pl?search_terms=&search_simple=1&action=process&json=1&page_size=1000&page=";
    List<Product> productList = new ArrayList<>();

    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;

    public void importProductData(){
        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper objectMapper = new ObjectMapper();
        int page = 990;
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

    public void importMembers(){
        Member member1 = new Member();
        member1.setFirstName("David");
        member1.setLastName("Fink");
        member1.setEmail("findaa21@htl-kaindorf.at");
        member1.setPassword("1234");
        member1.setPhone("+43 676 3075989");
        member1.setWeight(90);

        Member member2 = new Member();
        member2.setFirstName("Albin");
        member2.setLastName("Bajrami");
        member2.setEmail("bajala21@htl-kaindorf.at");
        member2.setPassword("1234");
        member2.setPhone("+43 676 9289502");
        member2.setWeight(75);

        List<Member> members = new ArrayList<>();
        members.add(member1);
        members.add(member2);

        memberRepository.saveAll(members);
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {

    }
}
