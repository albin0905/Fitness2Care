package at.kaindorf.backend.web;

import at.kaindorf.backend.pojos.Goal;
import at.kaindorf.backend.pojos.Workout;
import at.kaindorf.backend.repositorys.GoalRepository;
import at.kaindorf.backend.repositorys.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/goal")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class GoalController {
    private final GoalRepository goalRepository;

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

    @GetMapping("/{goalId}")
    public ResponseEntity<Goal> goalById(
            @PathVariable("goalId") Integer goalId
    ){
        Goal goal = goalRepository.getGoalByGoalId(goalId);

        if(goal != null){
            log.info("GET: Ziel " + goal + " wurde gefunden");
        }else{
            log.error("Fehler, Ziel " + goalId + " wurde nicht gefunden");
        }

        return ResponseEntity.ok(goal);
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

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(
            @PathVariable Integer id,
            @RequestBody Goal goal
    ){
        log.info("PUT: Goal mit der ID " + id +  " wird aktualisiert");

        return goalRepository.findById(id)
                .map(existingGoal -> {
                    existingGoal.setGoalName(goal.getGoalName());
                    existingGoal.setDate(goal.getDate());
                    existingGoal.setKcal(goal.getKcal());

                    Goal updatedGoal = goalRepository.save(existingGoal);
                    return ResponseEntity.ok(updatedGoal);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
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

    @GetMapping("/{date}")
    public ResponseEntity<List<Goal>> goalByDate(
            @PathVariable("date") LocalDate date
    ){
        List<Goal> goals = goalRepository.getGoalsByDate(date);

        if(goals != null){
            log.info("GET: Ziel(e) " + goals + " laufen heute ab.");
        }else{
            log.error("Fehler, keine Ziele wurden gefunden");
        }

        return ResponseEntity.ok(goals);
    }
}
