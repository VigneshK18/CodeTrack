package com.codetrack.service;

import com.codetrack.dto.StatsResponse;
import com.codetrack.exception.ResourceNotFoundException;
import com.codetrack.model.AppUser;
import com.codetrack.model.Problem;
import com.codetrack.model.UserProgress;
import com.codetrack.repository.ProblemRepository;
import com.codetrack.repository.UserProgressRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgressService {
    private final UserProgressRepository progressRepository;
    private final ProblemRepository problemRepository;

    public ProgressService(UserProgressRepository progressRepository, ProblemRepository problemRepository) {
        this.progressRepository = progressRepository;
        this.problemRepository = problemRepository;
    }

    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> markSolved(AppUser user, Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        UserProgress progress = progressRepository.findByUserAndProblem(user, problem).orElse(new UserProgress());
        progress.setUser(user);
        progress.setProblem(problem);
        progress.setStatus("SOLVED");
        progress.setSolvedAt(LocalDateTime.now());
        progressRepository.save(progress);

        return Map.of("message", "Problem marked as solved", "problemId", problemId);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Long> solvedIds(AppUser user) {
        return progressRepository.findByUser(user).stream()
                .map(p -> p.getProblem().getId())
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public StatsResponse stats(AppUser user) {
        List<Problem> allProblems = problemRepository.findAll();
        List<UserProgress> allProgress = progressRepository.findByUser(user);
        List<UserProgress> solved = allProgress.stream()
                .filter(p -> "SOLVED".equals(p.getStatus()))
                .toList();
        Set<Long> solvedProblemIds = solved.stream().map(p -> p.getProblem().getId()).collect(Collectors.toSet());

        long easySolved = countDifficulty(allProblems, solvedProblemIds, "Easy");
        long mediumSolved = countDifficulty(allProblems, solvedProblemIds, "Medium");
        long hardSolved = countDifficulty(allProblems, solvedProblemIds, "Hard");

        Map<String, Long> categoryTotals = allProblems.stream()
                .collect(Collectors.groupingBy(p -> safe(p.getCategory()), TreeMap::new, Collectors.counting()));

        Map<String, Long> categorySolved = allProblems.stream()
                .filter(p -> solvedProblemIds.contains(p.getId()))
                .collect(Collectors.groupingBy(p -> safe(p.getCategory()), TreeMap::new, Collectors.counting()));

        int streak = calculateStreak(solved);
        List<String> submissionDates = solved.stream()
                .filter(p -> p.getSolvedAt() != null)
                .map(p -> p.getSolvedAt().toLocalDate().toString())
                .distinct()
                .sorted()
                .toList();

        if (submissionDates == null) submissionDates = new ArrayList<>();

        List<Map<String, Object>> recentActivities = solved.stream()
                .filter(p -> p.getSolvedAt() != null)
                .sorted((a, b) -> b.getSolvedAt().compareTo(a.getSolvedAt()))
                .limit(5)
                .map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", p.getProblem().getId());
                    m.put("title", p.getProblem().getTitle());
                    m.put("difficulty", p.getProblem().getDifficulty());
                    m.put("solvedAt", p.getSolvedAt().toString());
                    return m;
                })
                .toList();

        return new StatsResponse(
                allProblems.size(),
                solved.size(),
                easySolved,
                mediumSolved,
                hardSolved,
                streak,
                categoryTotals,
                categorySolved,
                recentActivities,
                submissionDates
        );
    }

    private long countDifficulty(List<Problem> allProblems, Set<Long> solvedIds, String difficulty) {
        return allProblems.stream()
                .filter(p -> solvedIds.contains(p.getId()))
                .filter(p -> difficulty.equalsIgnoreCase(safe(p.getDifficulty())))
                .count();
    }

    private int calculateStreak(List<UserProgress> solved) {
        Set<LocalDate> dates = solved.stream()
                .filter(p -> p.getSolvedAt() != null)
                .map(p -> p.getSolvedAt().toLocalDate())
                .collect(Collectors.toSet());

        if (dates.isEmpty()) return 0;

        LocalDate current = LocalDate.now();
        if (!dates.contains(current)) {
            current = current.minusDays(1);
        }

        int streak = 0;
        while (dates.contains(current)) {
            streak++;
            current = current.minusDays(1);
        }
        return streak;
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Uncategorized" : value;
    }
}
