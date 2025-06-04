package at.kaindorf.backend.pojos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Data
@AllArgsConstructor
@NoArgsConstructor
@RequiredArgsConstructor
@Entity
@JsonIgnoreProperties(ignoreUnknown = true)
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Integer goalId;
    @NonNull
    @Column(nullable = false)
    private String goalName;
    @NonNull
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    @NonNull
    @Column(nullable = false)
    private Integer userId;
    @NonNull
    @Column(nullable = false)
    private Integer kcal;
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "goal_workout",
            joinColumns = @JoinColumn(name = "goal_id"),
            inverseJoinColumns = @JoinColumn(name = "workout_id")
    )
    @JsonManagedReference(value = "goal-workouts")
    private List<Workout> workouts = new ArrayList<>();

}
