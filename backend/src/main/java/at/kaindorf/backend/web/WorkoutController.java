package at.kaindorf.backend.web;

import at.kaindorf.backend.pojos.Workout;
import at.kaindorf.backend.repositorys.WorkoutRepository;
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
@RequestMapping("/workout")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class WorkoutController {
    private final WorkoutRepository workoutRepository;

    @GetMapping("/workouts")
    public ResponseEntity<List<Workout>> workouts() {
        List<Workout> workouts = workoutRepository.getAllWorkouts(); // Passe ggf. Methode an
        if (workouts != null) {
            log.info("GET: Alle vorhandenen Workouts werden angezeigt");
        } else {
            log.error("Fehler, Workouts wurden nicht gefunden");
        }

        return ResponseEntity.ok(workouts);
    }

    @GetMapping("/workout/{workoutName}")
    public ResponseEntity<Workout> workoutByName(
            @PathVariable("workoutName") String workoutName
    ){
        Workout workout = workoutRepository.getWorkoutByWorkoutName(workoutName);

        if(workout != null){
            log.info("GET: Workout " + workoutName + " gefunden");
        }else{
            log.error("Fehler, Workout wurde nicht gefunden");
        }

        return ResponseEntity.ok(workout);
    }

    @PostMapping("/addWorkout")
    public ResponseEntity<Workout> addWorkout(
            @RequestBody Workout workout
    ) {

        Optional<Workout> newWorkout = Optional.of(workoutRepository.save(workout));

        if(newWorkout.isPresent()){
            URI location = ServletUriComponentsBuilder
                    .fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(newWorkout.get().getWorkoutId())
                    .toUri();

            log.info("POST: Neues Workout wurde hinzugefügt");
            log.info(String.valueOf(newWorkout));

            return ResponseEntity.created(location).body(newWorkout.get());
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workout> updateWorkout(
            @PathVariable Integer id,
            @RequestBody Workout workout
    ){
        log.info("PUT: Workout mit der ID " + id +  " wird aktualisiert");

        return workoutRepository.findById(id)
                .map(existingWorkout -> {
                    existingWorkout.setTime(workout.getTime());
                    existingWorkout.setExercises(workout.getExercises());
                    existingWorkout.setWorkoutName(workout.getWorkoutName());
                    existingWorkout.setDescription(workout.getDescription());

                    Workout updatedWorkout = workoutRepository.save(existingWorkout);
                    return ResponseEntity.ok(updatedWorkout);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(
            @PathVariable Integer id)
    {
        if (workoutRepository.existsById(id)) {
            workoutRepository.deleteById(id);
            log.info("DELETE: Workout mit der ID " + id + " wurde gelöscht.");
            return ResponseEntity.noContent().build();
        } else {
            log.error("Workout mit der ID " + id + " wurde nicht gefunden.");
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/workout/details/{workoutName}")
    public ResponseEntity<Workout> getWorkoutDetails(@PathVariable("workoutName") String workoutName) {
        Workout workout = workoutRepository.getWorkoutWithExercisesByWorkoutName(workoutName);
        return ResponseEntity.ok(workout);
    }
    @GetMapping("/workout/details/id/{workoutId}")
    public ResponseEntity<Workout> getWorkoutDetailsById(@PathVariable("workoutId") Integer workoutId) {
        Workout workout = workoutRepository.getWorkoutWithExercisesByWorkoutId(workoutId);
        return ResponseEntity.ok(workout);
    }


}
