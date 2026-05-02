package com.codetrack.repository;

import com.codetrack.model.AppUser;
import com.codetrack.model.Note;
import com.codetrack.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {
    Optional<Note> findByUserAndProblem(AppUser user, Problem problem);
    List<Note> findByUser(AppUser user);
}
