package com.codetrack.controller;

import com.codetrack.dto.NoteRequest;
import com.codetrack.dto.NoteResponse;
import com.codetrack.model.AppUser;
import com.codetrack.service.NoteService;
import com.codetrack.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final NoteService noteService;
    private final UserService userService;

    public NoteController(NoteService noteService, UserService userService) {
        this.noteService = noteService;
        this.userService = userService;
    }

    @PostMapping("/{problemId}")
    public NoteResponse save(@AuthenticationPrincipal UserDetails userDetails,
                             @PathVariable Long problemId,
                             @RequestBody NoteRequest request) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        return noteService.saveNote(user, problemId, request.getNote());
    }

    @GetMapping("/{problemId}")
    public NoteResponse get(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long problemId) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        return noteService.getNote(user, problemId);
    }

    @GetMapping
    public List<NoteResponse> getAll(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        return noteService.getAllNotes(user);
    }

    @DeleteMapping("/{problemId}")
    public void delete(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long problemId) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        noteService.deleteNote(user, problemId);
    }
}
