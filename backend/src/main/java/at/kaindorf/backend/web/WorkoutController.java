package at.kaindorf.backend.web;

import at.kaindorf.backend.pojos.Member;
import at.kaindorf.backend.pojos.Workout;
import at.kaindorf.backend.repositorys.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.jdbc.Work;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/workout")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class WorkoutController {
    WorkoutRepository workoutRepository;

    @GetMapping("/workouts")
    public ResponseEntity<Workout> workouts(){
        Workout workouts = workoutRepository.getWorkouts();

        if(workouts != null){
            log.info("Alle vorhandenen Workouts werden angezeigt");
        }else{
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
            log.info("Workout " + workoutName + " gefunden");
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

            return ResponseEntity.created(location).body(newWorkout.get());
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
}
