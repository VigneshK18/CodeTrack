package com.codetrack.service;

import com.codetrack.dto.ProblemRequest;
import com.codetrack.exception.ResourceNotFoundException;
import com.codetrack.model.Problem;
import com.codetrack.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import com.codetrack.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Locale;

@Service
public class ProblemService {
    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public PageResponse<Problem> getProblems(String q, String category, String difficulty, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Problem> problemPage = problemRepository.findFilteredProblems(
                q != null && !q.isBlank() ? q : null,
                category,
                difficulty,
                pageable
        );
        
        return new PageResponse<>(
                problemPage.getContent(),
                problemPage.getNumber(),
                problemPage.getSize(),
                problemPage.getTotalElements(),
                problemPage.getTotalPages(),
                problemPage.isLast()
        );
    }

    public List<String> getCategories() {
        return problemRepository.findDistinctCategories();
    }

    public Problem getById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
    }

    public Problem create(ProblemRequest request) {
        Problem problem = new Problem();
        copyRequest(request, problem);
        problem.setSlug(generateSlug(request.getTitle()));
        return problemRepository.save(problem);
    }

    public Problem update(Long id, ProblemRequest request) {
        Problem problem = getById(id);
        copyRequest(request, problem);
        problem.setSlug(generateSlug(request.getTitle()) + "-" + id);
        return problemRepository.save(problem);
    }

    public void delete(Long id) {
        Problem problem = getById(id);
        problemRepository.delete(problem);
    }

    private void copyRequest(ProblemRequest request, Problem problem) {
        problem.setTitle(request.getTitle());
        problem.setDescription(request.getDescription());
        problem.setCategory(request.getCategory());
        problem.setDifficulty(request.getDifficulty());
        problem.setTags(request.getTags());
        problem.setInputFormat(request.getInputFormat());
        problem.setOutputFormat(request.getOutputFormat());
        problem.setConstraintsText(request.getConstraintsText());
        problem.setSampleInput(request.getSampleInput());
        problem.setSampleOutput(request.getSampleOutput());
        problem.setExplanation(request.getExplanation());
        problem.setJavaSolution(request.getJavaSolution());
        problem.setTimeComplexity(request.getTimeComplexity());
        problem.setSpaceComplexity(request.getSpaceComplexity());
    }

    private String generateSlug(String title) {
        return title.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "")
                + "-" + System.currentTimeMillis();
    }
}
