package com.codetrack.dto;

import java.time.LocalDateTime;

public class BookmarkResponse {
    private Long id;
    private Long problemId;
    private String problemTitle;
    private String category;
    private String difficulty;
    private String tag;
    private LocalDateTime createdAt;

    public BookmarkResponse(Long id, Long problemId, String problemTitle, String category, String difficulty, String tag, LocalDateTime createdAt) {
        this.id = id;
        this.problemId = problemId;
        this.problemTitle = problemTitle;
        this.category = category;
        this.difficulty = difficulty;
        this.tag = tag;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getProblemId() { return problemId; }
    public String getProblemTitle() { return problemTitle; }
    public String getCategory() { return category; }
    public String getDifficulty() { return difficulty; }
    public String getTag() { return tag; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
