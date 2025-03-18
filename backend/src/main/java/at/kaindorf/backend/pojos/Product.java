package at.kaindorf.backend.pojos;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@RequiredArgsConstructor
@Entity
public class Product {
    @Id
    private Long barcode;
    @NonNull
    @Column(columnDefinition = "TEXT")
    private String productName;
    @NonNull
    @Column(nullable = false)
    private Integer kcal_100g;
    @NonNull
    @Column(nullable = false)
    private String originCountry;
    @NonNull
    @Column(columnDefinition = "TEXT")
    private String ingredients;
}
