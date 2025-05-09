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
    @ManyToMany
    @JoinTable(
            name = "workout_exercise",
            joinColumns = @JoinColumn(name = "workout_id"),
            inverseJoinColumns = @JoinColumn(name = "exercise_id")
    )
    private List<Exercise> exercises = new ArrayList<>();
    @NonNull
    @Column(nullable = false)
    private String workoutName;
    @NonNull
    @Column(nullable = false)
    private String description;
}
