package com.codetrack.controller;

import com.codetrack.dto.ProblemRequest;
import com.codetrack.model.Problem;
import com.codetrack.service.ProblemService;
import jakarta.validation.Valid;
import com.codetrack.dto.PageResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {
    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping
    public PageResponse<Problem> getProblems(@RequestParam(required = false) String q,
                                     @RequestParam(required = false) String category,
                                     @RequestParam(required = false) String difficulty,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size) {
        return problemService.getProblems(q, category, difficulty, page, size);
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return problemService.getCategories();
    }

    @GetMapping("/{id}")
    public Problem getProblem(@PathVariable Long id) {
        return problemService.getById(id);
    }

    @PostMapping
    public Problem createProblem(@Valid @RequestBody ProblemRequest request) {
        return problemService.create(request);
    }

    @PutMapping("/{id}")
    public Problem updateProblem(@PathVariable Long id, @Valid @RequestBody ProblemRequest request) {
        return problemService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteProblem(@PathVariable Long id) {
        problemService.delete(id);
    }
}
