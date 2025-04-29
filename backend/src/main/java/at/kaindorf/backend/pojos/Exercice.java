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
public class Exercice {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer exerciseId;
    @NonNull
    @Column(nullable = false)
    private String exerciseName;
    @NonNull
    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private ExerciseLevel exerciceLevel;
    @NonNull
    @Column(nullable = false)
    private String bodyPart;
    @NonNull
    @Column(nullable = false)
    private String imageURL;
    @ManyToMany(mappedBy = "exercices")
    @ToString.Exclude
    private List<Workout> workouts = new ArrayList<>();
}
