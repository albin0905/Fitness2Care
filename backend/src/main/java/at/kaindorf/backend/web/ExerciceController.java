package at.kaindorf.backend.web;

import at.kaindorf.backend.pojos.Exercice;
import at.kaindorf.backend.repositorys.ExerciceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/exercise")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
@RequiredArgsConstructor
public class ExerciceController {

    private final ExerciceRepository exerciceRepository;

    @GetMapping("/exercices")
    public ResponseEntity<List<Exercice>> exercice(){
        List<Exercice> exercices = exerciceRepository.getExercice();

        if(exercices != null){
            log.info("GET: Alle vorhandenen Exercices werden angezeigt");
        }else{
            log.error("Fehler, Exercices wurden nicht gefunden");
        }

        return ResponseEntity.ok(exercices);
    }

    @GetMapping("/{exerciceName}")
    public ResponseEntity<Exercice> exerciceByName(
            @PathVariable("exerciceName") String exerciceName
    ){
        Exercice exercice = exerciceRepository.getExerciseByExerciseNameName(exerciceName);

        if(exercice != null){
            log.info("GET: Exercice " + exerciceName + " gefunden");
        }else{
            log.error("Fehler, Workout wurde nicht gefunden");
        }

        return ResponseEntity.ok(exercice);
    }

    @PostMapping("/addExercice")
    public ResponseEntity<Exercice> addExercice(
            @RequestBody Exercice exercice
    ) {

        Optional<Exercice> newExercice = Optional.of(exerciceRepository.save(exercice));

        if(newExercice.isPresent()){
            URI location = ServletUriComponentsBuilder
                    .fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(newExercice.get().getExerciseId())
                    .toUri();

            log.info("POST: Neue Exercic wurde hinzugefügt");
            log.info(String.valueOf(newExercice));

            return ResponseEntity.created(location).body(newExercice.get());
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exercice> updateExercice(
            @PathVariable Integer id,
            @RequestBody Exercice exercice
    ){
        log.info("PUT: Exercice mit der ID " + id +  " wird aktualisiert");

        return exerciceRepository.findById(id)
                .map(existingExercice -> {
                    existingExercice.setExerciceLevel(exercice.getExerciceLevel());
                    existingExercice.setExerciseName(exercice.getExerciseName());
                    existingExercice.setWorkouts(exercice.getWorkouts());
                    existingExercice.setBodyPart(exercice.getBodyPart());
                    existingExercice.setImageURL(exercice.getImageURL());

                    Exercice updatedExercice = exerciceRepository.save(existingExercice);
                    return ResponseEntity.ok(updatedExercice);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercice(
            @PathVariable Integer id)
    {
        if (exerciceRepository.existsById(id)) {
            exerciceRepository.deleteById(id);
            log.info("DELETE: Exercice mit der ID " + id + " wurde gelöscht.");
            return ResponseEntity.noContent().build();
        } else {
            log.error("Exercice mit der ID " + id + " wurde nicht gefunden.");
            return ResponseEntity.notFound().build();
        }
    }
}
