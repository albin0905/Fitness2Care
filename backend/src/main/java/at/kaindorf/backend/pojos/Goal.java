package at.kaindorf.backend.pojos;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Locale;

@Data
@AllArgsConstructor
@NoArgsConstructor
@RequiredArgsConstructor
@Entity
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer goalId;
    @NonNull
    @Column(nullable = false)
    private String goalName;
    @NonNull
    @Column(nullable = false)
    private LocalDate date;
    @NonNull
    @Column(nullable = false)
    private Integer userId;
    @NonNull
    @Column(nullable = false)
    private Integer kcal;
}
