package at.kaindorf.backend.web;

import at.kaindorf.backend.pojos.Exercise;
import at.kaindorf.backend.repositorys.ExerciseRepository;
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
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;

    @GetMapping("/exercises")
    public ResponseEntity<List<Exercise>> exercise(){
        List<Exercise> exercises = exerciseRepository.getExercice();

        if(exercises != null){
            log.info("GET: Alle vorhandenen Exercises werden angezeigt");
        }else{
            log.error("Fehler, Exercises wurden nicht gefunden");
        }

        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/{exerciseName}")
    public ResponseEntity<Exercise> exerciseByName(
            @PathVariable("exerciseName") String exerciseName
    ){
        Exercise exercise = exerciseRepository.getExerciseByExerciseNameName(exerciseName);

        if(exercise != null){
            log.info("GET: Exercise " + exerciseName + " gefunden");
        }else{
            log.error("Fehler, Workout wurde nicht gefunden");
        }

        return ResponseEntity.ok(exercise);
    }

    @PostMapping("/addExercise")
    public ResponseEntity<Exercise> addExercise(
            @RequestBody Exercise exercise
    ) {

        Optional<Exercise> newExercise = Optional.of(exerciseRepository.save(exercise));

        if(newExercise.isPresent()){
            URI location = ServletUriComponentsBuilder
                    .fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(newExercise.get().getExerciseId())
                    .toUri();

            log.info("POST: Neue Exercic wurde hinzugefügt");
            log.info(String.valueOf(newExercise));

            return ResponseEntity.created(location).body(newExercise.get());
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exercise> updateExercise(
            @PathVariable Integer id,
            @RequestBody Exercise exercise
    ){
        log.info("PUT: Exercise mit der ID " + id +  " wird aktualisiert");

        return exerciseRepository.findById(id)
                .map(existingExercise -> {
                    existingExercise.setExerciseLevel(exercise.getExerciseLevel());
                    existingExercise.setExerciseName(exercise.getExerciseName());
                    existingExercise.setWorkouts(exercise.getWorkouts());
                    existingExercise.setBodyPart(exercise.getBodyPart());
                    existingExercise.setImageURL(exercise.getImageURL());
                    existingExercise.setKcal(exercise.getKcal());
                    existingExercise.setDescription(exercise.getDescription());

                    Exercise updatedExercise = exerciseRepository.save(existingExercise);
                    return ResponseEntity.ok(updatedExercise);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(
            @PathVariable Integer id)
    {
        if (exerciseRepository.existsById(id)) {
            exerciseRepository.deleteById(id);
            log.info("DELETE: Exercise mit der ID " + id + " wurde gelöscht.");
            return ResponseEntity.noContent().build();
        } else {
            log.error("Exercise mit der ID " + id + " wurde nicht gefunden.");
            return ResponseEntity.notFound().build();
        }
    }
}
