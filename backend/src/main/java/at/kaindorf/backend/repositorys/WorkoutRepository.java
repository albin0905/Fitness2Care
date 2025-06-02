package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Member;
import at.kaindorf.backend.pojos.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Integer> {

    @Query("SELECT w FROM Workout w")
    List<Workout> getAllWorkouts();

    @Query("SELECT w FROM Workout w WHERE w.workoutName = ?1")
    Workout getWorkoutByWorkoutName(String workoutName);

    @Query("SELECT w FROM Workout w LEFT JOIN FETCH w.exercises WHERE w.workoutName = ?1")
    Workout getWorkoutWithExercisesByWorkoutName(@Param("workoutName") String workoutName);

    @Query("SELECT w FROM Workout w LEFT JOIN FETCH w.exercises WHERE w.workoutId = ?1")
    Workout getWorkoutWithExercisesByWorkoutId(@Param("id") Integer id);

}
