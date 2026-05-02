package com.codetrack.service;

import com.codetrack.dto.CodeExecutionRequest;
import com.codetrack.dto.CodeExecutionResponse;
import com.codetrack.model.AppUser;
import com.codetrack.model.Problem;
import com.codetrack.repository.ProblemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CodeExecutionService {

    private final ProblemRepository problemRepository;
    private final ProgressService progressService;
    private final ObjectMapper objectMapper;

    public CodeExecutionService(ProblemRepository problemRepository, ProgressService progressService) {
        this.problemRepository = problemRepository;
        this.progressService = progressService;
        this.objectMapper = new ObjectMapper();
    }

    public CodeExecutionResponse executeCode(CodeExecutionRequest request, AppUser user) {
        String code = request.getCode();
        if (code == null || code.trim().isEmpty()) {
            return new CodeExecutionResponse("", "Code cannot be empty", false);
        }

        String className = extractClassName(code);
        if (className == null) {
            return new CodeExecutionResponse("", "Could not find a public class in your code.", false);
        }

        Path tempDir = null;
        try {
            String uniqueId = UUID.randomUUID().toString();
            tempDir = Files.createTempDirectory("execution_" + uniqueId);
            File sourceFile = new File(tempDir.toFile(), className + ".java");
            Files.writeString(sourceFile.toPath(), code);

            // 1. Compile
            ProcessBuilder compilePb = new ProcessBuilder("javac", sourceFile.getName());
            compilePb.directory(tempDir.toFile());
            Process compileProcess = compilePb.start();
            
            String compileError = readOutput(compileProcess.getErrorStream());
            boolean compiled = compileProcess.waitFor(15, TimeUnit.SECONDS);

            if (!compiled || compileProcess.exitValue() != 0) {
                if (!compiled) compileProcess.destroyForcibly();
                return new CodeExecutionResponse("", "Compilation Error:\n" + compileError, false);
            }

            // 2. Run Test Cases
            Problem problem = null;
            if (request.getProblemId() != null) {
                problem = problemRepository.findById(request.getProblemId()).orElse(null);
            }

            List<CodeExecutionResponse.TestCaseResult> results = new ArrayList<>();
            boolean allPassed = true;
            String lastOutput = "";
            String lastError = "";

            if (problem != null && problem.getTestCasesJson() != null && !problem.getTestCasesJson().isBlank()) {
                JsonNode testCases = objectMapper.readTree(problem.getTestCasesJson());
                for (JsonNode tc : testCases) {
                    String input = tc.get("input").asText();
                    String expected = tc.get("output").asText();

                    ProcessBuilder runPb = new ProcessBuilder("java", className);
                    runPb.directory(tempDir.toFile());
                    Process runProcess = runPb.start();

                    // Send Input
                    try (OutputStream os = runProcess.getOutputStream()) {
                        os.write(input.getBytes());
                        os.flush();
                    }

                    String runOutput = readOutput(runProcess.getInputStream());
                    String runError = readOutput(runProcess.getErrorStream());
                    boolean finished = runProcess.waitFor(5, TimeUnit.SECONDS);

                    if (!finished) {
                        runProcess.destroyForcibly();
                        results.add(new CodeExecutionResponse.TestCaseResult(input, expected, "Time Limit Exceeded", false));
                        allPassed = false;
                        lastError = "Time Limit Exceeded";
                    } else if (runProcess.exitValue() != 0) {
                        results.add(new CodeExecutionResponse.TestCaseResult(input, expected, "Runtime Error: " + runError, false));
                        allPassed = false;
                        lastError = "Runtime Error";
                    } else {
                        boolean passed = runOutput.trim().equals(expected.trim());
                        results.add(new CodeExecutionResponse.TestCaseResult(input, expected, runOutput, passed));
                        if (!passed) allPassed = false;
                        lastOutput = runOutput;
                    }
                }
                
                // Auto-mark solved
                if (allPassed && user != null && problem != null) {
                    progressService.markSolved(user, problem.getId());
                }

            } else {
                // No test cases, just run once
                ProcessBuilder runPb = new ProcessBuilder("java", className);
                runPb.directory(tempDir.toFile());
                Process runProcess = runPb.start();
                
                String runOutput = readOutput(runProcess.getInputStream());
                String runError = readOutput(runProcess.getErrorStream());
                boolean finished = runProcess.waitFor(5, TimeUnit.SECONDS);

                if (!finished) {
                    runProcess.destroyForcibly();
                    return new CodeExecutionResponse(runOutput, "Time Limit Exceeded", false);
                }
                if (runProcess.exitValue() != 0) {
                    return new CodeExecutionResponse(runOutput, "Runtime Error:\n" + runError, false);
                }
                
                lastOutput = runOutput;
                allPassed = true;
            }

            CodeExecutionResponse response = new CodeExecutionResponse(lastOutput, lastError, true);
            response.setTestResults(results);
            response.setAllPassed(allPassed);
            return response;

        } catch (Exception e) {
            return new CodeExecutionResponse("", "Server Error: " + e.getMessage(), false);
        } finally {
            if (tempDir != null) deleteDirectory(tempDir.toFile());
        }
    }

    private String extractClassName(String code) {
        Pattern pattern = Pattern.compile("public\\s+class\\s+([A-Za-z0-9_]+)");
        Matcher matcher = pattern.matcher(code);
        return matcher.find() ? matcher.group(1) : null;
    }

    private String readOutput(java.io.InputStream inputStream) throws Exception {
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        return output.toString();
    }

    private void deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) deleteDirectory(file);
        }
        directoryToBeDeleted.delete();
    }
}
