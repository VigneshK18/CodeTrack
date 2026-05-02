package com.codetrack.dto;

import jakarta.validation.constraints.NotBlank;

public class ProblemRequest {
    @NotBlank
    private String title;
    private String description;
    private String category;
    private String difficulty;
    private String tags;
    private String inputFormat;
    private String outputFormat;
    private String constraintsText;
    private String sampleInput;
    private String sampleOutput;
    private String explanation;
    private String javaSolution;
    private String timeComplexity;
    private String spaceComplexity;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getInputFormat() { return inputFormat; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }
    public String getOutputFormat() { return outputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }
    public String getConstraintsText() { return constraintsText; }
    public void setConstraintsText(String constraintsText) { this.constraintsText = constraintsText; }
    public String getSampleInput() { return sampleInput; }
    public void setSampleInput(String sampleInput) { this.sampleInput = sampleInput; }
    public String getSampleOutput() { return sampleOutput; }
    public void setSampleOutput(String sampleOutput) { this.sampleOutput = sampleOutput; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getJavaSolution() { return javaSolution; }
    public void setJavaSolution(String javaSolution) { this.javaSolution = javaSolution; }
    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }
    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }
}
