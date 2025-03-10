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
public class Workout {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer workoutId;
    @NonNull
    @Column(nullable = false)
    private Integer time;
    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL)
    private List<Exercice> exercices = new ArrayList<>();
    @NonNull
    @Column(nullable = false)
    private String workoutName;
    @NonNull
    @Column(nullable = false)
    private String kcal;
}
