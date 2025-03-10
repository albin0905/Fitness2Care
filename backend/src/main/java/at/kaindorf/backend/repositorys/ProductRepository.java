package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
