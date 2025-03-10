package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutRepository extends JpaRepository<Workout, Integer> {
}
