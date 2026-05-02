package com.codetrack.controller;

import com.codetrack.dto.AuthRequest;
import com.codetrack.dto.AuthResponse;
import com.codetrack.dto.RegisterRequest;
import com.codetrack.model.AppUser;
import com.codetrack.service.AuthService;
import com.codetrack.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @GetMapping("/profile")
    public Map<String, Object> profile(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "createdAt", user.getCreatedAt()
        );
    }
}
