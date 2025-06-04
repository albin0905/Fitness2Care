    package at.kaindorf.backend.pojos;

    import com.fasterxml.jackson.annotation.JsonBackReference;
    import com.fasterxml.jackson.annotation.JsonIgnore;
    import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
    import com.fasterxml.jackson.annotation.JsonManagedReference;
    import jakarta.persistence.*;
    import lombok.*;

    import java.util.ArrayList;
    import java.util.List;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @RequiredArgsConstructor
    @Entity
    @JsonIgnoreProperties(ignoreUnknown = true)

    public class Workout {
        @Id
        @GeneratedValue(strategy = GenerationType.SEQUENCE)
        private Integer workoutId;
        @NonNull
        @Column(nullable = false)
        private Integer time;
        @ManyToMany
        @JsonManagedReference(value = "workout-exercises")
        @ToString.Exclude
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
        @ManyToMany(mappedBy = "workouts")
        @JsonBackReference(value = "goal-workouts")
        @ToString.Exclude
        private List<Goal> goals = new ArrayList<>();
    }
