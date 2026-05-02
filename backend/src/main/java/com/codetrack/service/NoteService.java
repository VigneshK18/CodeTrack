package com.codetrack.service;

import com.codetrack.dto.NoteResponse;
import com.codetrack.exception.ResourceNotFoundException;
import com.codetrack.model.AppUser;
import com.codetrack.model.Note;
import com.codetrack.model.Problem;
import com.codetrack.repository.NoteRepository;
import com.codetrack.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {
    private final NoteRepository noteRepository;
    private final ProblemRepository problemRepository;

    public NoteService(NoteRepository noteRepository, ProblemRepository problemRepository) {
        this.noteRepository = noteRepository;
        this.problemRepository = problemRepository;
    }

    public NoteResponse saveNote(AppUser user, Long problemId, String noteText) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        Note note = noteRepository.findByUserAndProblem(user, problem).orElse(new Note());
        note.setUser(user);
        note.setProblem(problem);
        note.setNote(noteText);

        Note saved = noteRepository.save(note);
        return toResponse(saved);
    }

    public NoteResponse getNote(AppUser user, Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        Note note = noteRepository.findByUserAndProblem(user, problem)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        return toResponse(note);
    }

    public List<NoteResponse> getAllNotes(AppUser user) {
        return noteRepository.findByUser(user).stream()
                .map(this::toResponse)
                .toList();
    }

    public void deleteNote(AppUser user, Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        Note note = noteRepository.findByUserAndProblem(user, problem)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        noteRepository.delete(note);
    }

    private NoteResponse toResponse(Note note) {
        return new NoteResponse(
                note.getId(),
                note.getProblem().getId(),
                note.getProblem().getTitle(),
                note.getNote(),
                note.getUpdatedAt()
        );
    }
}
