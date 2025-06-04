package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Goal;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Integer> {
    List<Goal> getGoalsByUserId(@NonNull Integer userId);

    Goal getGoalByGoalId(Integer goalId);

    @Query("SELECT g FROM Goal g WHERE g.userId = :memberId AND g.date >= :date ORDER BY g.date DESC LIMIT 1")
    Goal findCurrentGoalByMemberIdAndDate(Long memberId, LocalDate date);
}
