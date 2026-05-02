package com.codetrack.dto;

import java.util.List;

public class CodeExecutionResponse {
    private String output;
    private String error;
    private boolean success;
    private List<TestCaseResult> testResults;
    private boolean allPassed;

    public CodeExecutionResponse() {
    }

    public CodeExecutionResponse(String output, String error, boolean success) {
        this.output = output;
        this.error = error;
        this.success = success;
    }

    public static class TestCaseResult {
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean passed;

        public TestCaseResult() {}
        public TestCaseResult(String input, String expectedOutput, String actualOutput, boolean passed) {
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.actualOutput = actualOutput;
            this.passed = passed;
        }

        public String getInput() { return input; }
        public void setInput(String input) { this.input = input; }
        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
        public String getActualOutput() { return actualOutput; }
        public void setActualOutput(String actualOutput) { this.actualOutput = actualOutput; }
        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }
    }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public List<TestCaseResult> getTestResults() { return testResults; }
    public void setTestResults(List<TestCaseResult> testResults) { this.testResults = testResults; }
    public boolean isAllPassed() { return allPassed; }
    public void setAllPassed(boolean allPassed) { this.allPassed = allPassed; }
}
