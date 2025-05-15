package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Goal;
import at.kaindorf.backend.pojos.Product;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByProductNameContainingIgnoreCase(String productName);}
