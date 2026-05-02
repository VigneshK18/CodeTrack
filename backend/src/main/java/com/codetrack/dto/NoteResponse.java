package com.codetrack.dto;

import java.time.LocalDateTime;

public class NoteResponse {
    private Long id;
    private Long problemId;
    private String problemTitle;
    private String note;
    private LocalDateTime updatedAt;

    public NoteResponse(Long id, Long problemId, String problemTitle, String note, LocalDateTime updatedAt) {
        this.id = id;
        this.problemId = problemId;
        this.problemTitle = problemTitle;
        this.note = note;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public Long getProblemId() { return problemId; }
    public String getProblemTitle() { return problemTitle; }
    public String getNote() { return note; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
