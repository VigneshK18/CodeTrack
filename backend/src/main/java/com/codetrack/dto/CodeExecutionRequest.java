package com.codetrack.dto;

public class CodeExecutionRequest {
    private String code;
    private Long problemId;

    public CodeExecutionRequest() {
    }

    public CodeExecutionRequest(String code, Long problemId) {
        this.code = code;
        this.problemId = problemId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Long getProblemId() {
        return problemId;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }
}
