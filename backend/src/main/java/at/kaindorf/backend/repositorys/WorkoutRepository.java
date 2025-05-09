package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Member;
import at.kaindorf.backend.pojos.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Integer> {

    @Query("SELECT w FROM Workout w")
    List<Workout> getWorkouts();

    @Query("SELECT w FROM Workout w WHERE w.workoutName = ?1")
    Workout getWorkoutByWorkoutName(String workoutName);

    @Query("SELECT w FROM Workout w LEFT JOIN FETCH w.exercices WHERE w.workoutName = :workoutName")
    Workout getWorkoutWithExercisesByWorkoutName(@Param("workoutName") String workoutName);
}
