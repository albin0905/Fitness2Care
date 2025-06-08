package at.kaindorf.backend.pojos;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@RequiredArgsConstructor
@Entity
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer exerciseId;
    @NonNull
    @Column(nullable = false)
    private String exerciseName;
    @NonNull
    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private ExerciseLevel exerciseLevel;
    @NonNull
    @Column(nullable = false)
    private String bodyPart;
    @NonNull
    @Column(nullable = false)
    private String imageURL;
    @NonNull
    @Column(nullable = false)
    private Integer kcal;
    @NonNull
    @Column(nullable = false)
    private String description;
    @ManyToMany(mappedBy = "exercises")
    @ToString.Exclude
    //@JsonBackReference(value = "workout-exercises")
    @JsonIgnore
    private List<Workout> workouts;
}
