package com.codetrack.controller;

import com.codetrack.dto.StatsResponse;
import com.codetrack.model.AppUser;
import com.codetrack.service.ProgressService;
import com.codetrack.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
    private final ProgressService progressService;
    private final UserService userService;

    public ProgressController(ProgressService progressService, UserService userService) {
        this.progressService = progressService;
        this.userService = userService;
    }

    @PostMapping("/solved/{problemId}")
    public Map<String, Object> markSolved(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long problemId) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        return progressService.markSolved(user, problemId);
    }

    @GetMapping("/solved-ids")
    public List<Long> solvedIds(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        return progressService.solvedIds(user);
    }

    @GetMapping("/stats")
    public StatsResponse stats(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        return progressService.stats(user);
    }
}
