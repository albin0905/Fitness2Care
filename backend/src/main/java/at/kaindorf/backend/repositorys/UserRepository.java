package at.kaindorf.backend.repositorys;

import at.kaindorf.backend.pojos.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<Member, Integer> {
}
