package at.kaindorf.backend.pojos;

import jakarta.persistence.*;
import lombok.*;

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
    private ExerciseLevel exerciceLevel;
    @NonNull
    @Column(nullable = false)
    private String bodyPart;
    @NonNull
    @Column(nullable = false)
    private String imageURL;
    @ManyToOne
    @JoinColumn(name = "workout_id")
    @ToString.Exclude
    private Workout workout;
}
