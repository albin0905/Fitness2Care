package at.kaindorf.backend.web;

import at.kaindorf.backend.pojos.Goal;
import at.kaindorf.backend.pojos.Product;
import at.kaindorf.backend.repositorys.MemberRepository;
import at.kaindorf.backend.repositorys.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class ProductController {
    private final ProductRepository productRepository;

    @GetMapping("/filterByName/{name}")
    public ResponseEntity<List<Product>> goals(
            @PathVariable("name") String productName
    ){
        List<Product> product = productRepository.findByProductNameContainingIgnoreCase(productName);

        if(product != null){
            log.info("GET: Alle Produkte die den Namen " + productName + " beinhalten wurden gefunden");
        }else{
            log.error("Fehler, Produkte die den Namen " + productName + " beinhalten wurden nicht gefunden");
        }

        return ResponseEntity.ok(product);
    }

}
