package at.kaindorf.backend.web;

import at.kaindorf.backend.pojos.Member;
import at.kaindorf.backend.repositorys.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/member")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class MemberController {
    private final MemberRepository memberRepository;

    @GetMapping("/login")
    public ResponseEntity<Member> login(
            @RequestParam(name = "email", required = true) String email,
            @RequestParam(name = "password", required = true) String password
    ){
        log.info("Member " + email + " hat sich eingeloggt");

        Member member = memberRepository.login(email, password);

        return ResponseEntity.ok(member);
    }

    @PostMapping("/register")
    public ResponseEntity<Member> register(
            @RequestBody Member member
    ) {
        Optional<Member> newMember = Optional.of(memberRepository.save(member));

        if(newMember.isPresent()){
            URI location = ServletUriComponentsBuilder
                    .fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(newMember.get().getMemberId())
                    .toUri();

            return ResponseEntity.created(location).body(newMember.get());
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
}
