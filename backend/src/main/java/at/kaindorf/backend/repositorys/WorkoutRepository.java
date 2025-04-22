package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Member;
import at.kaindorf.backend.pojos.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WorkoutRepository extends JpaRepository<Workout, Integer> {

    @Query("SELECT w FROM Workout w")
    Workout getWorkouts();

    @Query("SELECT w FROM Workout w WHERE w.workoutName = ?1")
    Workout getWorkoutByWorkoutName(String workoutName);
}
