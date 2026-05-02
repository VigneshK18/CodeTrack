package com.codetrack.repository;

import com.codetrack.model.AppUser;
import com.codetrack.model.Bookmark;
import com.codetrack.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUserAndProblem(AppUser user, Problem problem);
    List<Bookmark> findByUser(AppUser user);
    boolean existsByUserAndProblem(AppUser user, Problem problem);
}
