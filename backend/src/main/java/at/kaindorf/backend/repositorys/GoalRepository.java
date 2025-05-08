package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Goal;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Integer> {
    List<Goal> getGoalsByUserId(@NonNull Integer userId);

    Goal getGoalByGoalId(Integer goalId);
}
