package at.kaindorf.backend.web;

import at.kaindorf.backend.pojos.Member;
import at.kaindorf.backend.pojos.Workout;
import at.kaindorf.backend.repositorys.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
