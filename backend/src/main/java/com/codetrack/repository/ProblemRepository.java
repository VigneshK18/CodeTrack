package com.codetrack.repository;

import com.codetrack.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findBySlug(String slug);
    
    @Query("SELECT p FROM Problem p WHERE " +
           "(:q IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.tags) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:category IS NULL OR :category = 'All' OR p.category = :category) AND " +
           "(:difficulty IS NULL OR :difficulty = 'All' OR p.difficulty = :difficulty)")
    Page<Problem> findFilteredProblems(String q, String category, String difficulty, Pageable pageable);

    @Query("SELECT DISTINCT p.category FROM Problem p WHERE p.category IS NOT NULL")
    List<String> findDistinctCategories();

    boolean existsByTitle(String title);
}
