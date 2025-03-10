package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Exercice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciceRepository extends JpaRepository<Exercice,Integer> {
}
