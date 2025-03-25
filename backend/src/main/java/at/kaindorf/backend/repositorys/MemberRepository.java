package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Integer> {
    @Query("SELECT m FROM Member m WHERE m.email = ?1 AND m.password = ?2")
    Member login(String email, String password);
}
