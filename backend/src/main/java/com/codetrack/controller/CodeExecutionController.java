package com.codetrack.controller;

import com.codetrack.dto.CodeExecutionRequest;
import com.codetrack.dto.CodeExecutionResponse;
import com.codetrack.model.AppUser;
import com.codetrack.service.CodeExecutionService;
import com.codetrack.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/execution")
@CrossOrigin(origins = "http://localhost:5173")
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;
    private final UserService userService;

    @Autowired
    public CodeExecutionController(CodeExecutionService codeExecutionService, UserService userService) {
        this.codeExecutionService = codeExecutionService;
        this.userService = userService;
    }

    @PostMapping("/run")
    public ResponseEntity<CodeExecutionResponse> runCode(@RequestBody CodeExecutionRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        AppUser user = null;
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            user = userService.getByEmail(auth.getName());
        }
        
        CodeExecutionResponse response = codeExecutionService.executeCode(request, user);
        return ResponseEntity.ok(response);
    }
}
