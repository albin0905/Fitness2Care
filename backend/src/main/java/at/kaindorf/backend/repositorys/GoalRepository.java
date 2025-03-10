package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, Integer> {
}
