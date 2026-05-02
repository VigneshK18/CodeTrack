package com.codetrack.dto;

import java.util.List;
import java.util.Map;

public class StatsResponse {
    private long totalProblems;
    private long solvedProblems;
    private long easySolved;
    private long mediumSolved;
    private long hardSolved;
    private int currentStreak;
    private Map<String, Long> categoryTotals;
    private Map<String, Long> categorySolved;
    private List<Map<String, Object>> recentActivities;
    private List<String> submissionDates;

    public StatsResponse(long totalProblems, long solvedProblems, long easySolved, long mediumSolved, long hardSolved,
                         int currentStreak, Map<String, Long> categoryTotals, Map<String, Long> categorySolved,
                         List<Map<String, Object>> recentActivities, List<String> submissionDates) {
        this.totalProblems = totalProblems;
        this.solvedProblems = solvedProblems;
        this.easySolved = easySolved;
        this.mediumSolved = mediumSolved;
        this.hardSolved = hardSolved;
        this.currentStreak = currentStreak;
        this.categoryTotals = categoryTotals;
        this.categorySolved = categorySolved;
        this.recentActivities = recentActivities;
        this.submissionDates = submissionDates;
    }

    public long getTotalProblems() { return totalProblems; }
    public long getSolvedProblems() { return solvedProblems; }
    public long getEasySolved() { return easySolved; }
    public long getMediumSolved() { return mediumSolved; }
    public long getHardSolved() { return hardSolved; }
    public int getCurrentStreak() { return currentStreak; }
    public Map<String, Long> getCategoryTotals() { return categoryTotals; }
    public Map<String, Long> getCategorySolved() { return categorySolved; }
    public List<Map<String, Object>> getRecentActivities() { return recentActivities; }
    public List<String> getSubmissionDates() { return submissionDates; }
}
