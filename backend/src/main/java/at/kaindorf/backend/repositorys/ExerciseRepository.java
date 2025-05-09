package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise,Integer> {

    @Query("SELECT e FROM Exercise e")
    List<Exercise> getExercice();

    @Query("SELECT e FROM Exercise e WHERE e.exerciseName = ?1")
    Exercise getExerciseByExerciseNameName(String exerciseName);
}
