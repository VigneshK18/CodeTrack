package com.codetrack.repository;

import com.codetrack.model.AppUser;
import com.codetrack.model.Problem;
import com.codetrack.model.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    Optional<UserProgress> findByUserAndProblem(AppUser user, Problem problem);
    List<UserProgress> findByUser(AppUser user);
    boolean existsByUserAndProblem(AppUser user, Problem problem);
}
