package at.kaindorf.backend.web;

import at.kaindorf.backend.pojos.Goal;
import at.kaindorf.backend.pojos.Workout;
import at.kaindorf.backend.repositorys.GoalRepository;
import at.kaindorf.backend.repositorys.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/goal")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j
@RequiredArgsConstructor
public class GoalController {
    private final GoalRepository goalRepository;
    private final WorkoutRepository workoutRepository;

    @GetMapping("/goals/{userId}")
    public ResponseEntity<List<Goal>> goals(
            @PathVariable("userId") Integer id
    ){
        List<Goal> goals = goalRepository.getGoalsByUserId(id);

        if(goals != null){
            log.info("GET: Alle Ziele vom Member mit der " + id + " wurden gefunden");
        }else{
            log.error("Fehler, Ziele von Member " + id + " wurden nicht gefunden");
        }

        return ResponseEntity.ok(goals);
    }

    @GetMapping("/goal/id/{id}")
    public ResponseEntity<Goal> goalById(@PathVariable("id") Integer goalId) {
        Goal goal = goalRepository.getGoalByGoalId(goalId);

        if (goal != null) {
            log.info("GET: Ziel " + goal + " wurde gefunden");
            return ResponseEntity.ok(goal);
        } else {
            log.error("Fehler, Ziel " + goalId + " wurde nicht gefunden");
            return ResponseEntity.notFound().build();
        }
    }


    @PostMapping("/addGoal")
    public ResponseEntity<Goal> addGoal(
            @RequestBody Goal goal
    ) {

        Optional<Goal> newGoal = Optional.of(goalRepository.save(goal));

        if(newGoal.isPresent()){
            URI location = ServletUriComponentsBuilder
                    .fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(newGoal.get().getGoalId())
                    .toUri();

            log.info("POST: Neues Ziel wurde hinzugefügt");
            log.info(String.valueOf(newGoal));

            return ResponseEntity.created(location).body(newGoal.get());
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Goal> updateGoalKcal(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> updates) {

        return goalRepository.findById(id)
                .map(existingGoal -> {
                    if (updates.containsKey("kcal")) {
                        existingGoal.setKcal((Integer) updates.get("kcal"));
                    }
                    return ResponseEntity.ok(goalRepository.save(existingGoal));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Integer id)
    {
        if (goalRepository.existsById(id)) {
            goalRepository.deleteById(id);
            log.info("DELETE: Goal mit der ID " + id + " wurde gelöscht.");
            return ResponseEntity.noContent().build();
        } else {
            log.error("Goal mit der ID " + id + " wurde nicht gefunden.");
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/currentGoal/{memberId}/{date}")
    public ResponseEntity<Goal> getCurrentGoalByMemberAndDate(
            @PathVariable("memberId") Long memberId,
            @PathVariable("date") LocalDate date
    ) {
        Goal goal = goalRepository.findCurrentGoalByMemberIdAndDate(memberId, date);

        if (goal != null) {
            log.info("GET: Aktuelles Ziel für Mitglied " + memberId + ": " + goal);
            return ResponseEntity.ok(goal);
        } else {
            log.warn("Kein aktuelles Ziel für Mitglied " + memberId + " am " + date + " gefunden.");
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping(value = "/{goalId}/add-workout", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Goal> addWorkoutToGoal(
            @PathVariable Integer goalId,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            if (!payload.containsKey("workoutId")) {
                log.error("Payload enthält keinen workoutId");
                return ResponseEntity.badRequest().body(null);
            }

            Number workoutIdNum = (Number) payload.get("workoutId");
            Integer workoutId = workoutIdNum.intValue();

            Optional<Goal> goalOpt = goalRepository.findById(goalId);
            if (goalOpt.isEmpty()) {
                log.error("Goal mit ID {} nicht gefunden", goalId);
                return ResponseEntity.notFound().build();
            }
            Goal existingGoal = goalOpt.get();

            Optional<Workout> workoutToAdd = workoutRepository.findById(workoutId);
            if (workoutToAdd.isEmpty()) {
                log.error("Workout mit ID {} nicht gefunden", workoutId);
                return ResponseEntity.badRequest().build();
            }

            existingGoal.getWorkouts().add(workoutToAdd.get());
            goalRepository.save(existingGoal);
            log.info("Workout {} zu Goal {} hinzugefügt", workoutId, goalId);

            return ResponseEntity.ok(existingGoal);
        } catch (Exception e) {
            log.error("Fehler beim Hinzufügen des Workouts zum Ziel", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(@PathVariable Integer id) {
        Goal goal = goalRepository.getGoalByGoalId(id);
        if (goal != null) {
            return ResponseEntity.ok(goal);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}
