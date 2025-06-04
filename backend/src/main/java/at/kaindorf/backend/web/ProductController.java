package at.kaindorf.backend.web;

import at.kaindorf.backend.pojos.Goal;
import at.kaindorf.backend.pojos.Product;
import at.kaindorf.backend.repositorys.MemberRepository;
import at.kaindorf.backend.repositorys.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    public ResponseEntity<Page<Product>> goals(
            @PathVariable("name") String productName,
            @RequestParam(defaultValue = "0") int page

    ){
        Pageable pageable = PageRequest.of(page, 50);
        Page<Product> product = productRepository.findByProductNameContainingIgnoreCase(productName, pageable);

        if(product != null){
            log.info("GET: Alle Produkte die den Namen " + productName + " beinhalten wurden gefunden");
        }else{
            log.error("Fehler, Produkte die den Namen " + productName + " beinhalten wurden nicht gefunden");
        }

        return ResponseEntity.ok(product);
    }

}
