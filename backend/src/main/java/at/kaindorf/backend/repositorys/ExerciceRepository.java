package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Exercice;
import at.kaindorf.backend.pojos.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExerciceRepository extends JpaRepository<Exercice,Integer> {

    @Query("SELECT e FROM Exercice e")
    List<Exercice> getExercice();

    @Query("SELECT e FROM Exercice e WHERE e.exerciseName = ?1")
    Exercice getExerciseByExerciseNameName(String exerciseName);
}
