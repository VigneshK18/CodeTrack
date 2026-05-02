package com.codetrack.service;

import com.codetrack.dto.BookmarkResponse;
import com.codetrack.exception.ResourceNotFoundException;
import com.codetrack.model.AppUser;
import com.codetrack.model.Bookmark;
import com.codetrack.model.Problem;
import com.codetrack.repository.BookmarkRepository;
import com.codetrack.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@org.springframework.transaction.annotation.Transactional
public class BookmarkService {
    private final BookmarkRepository bookmarkRepository;
    private final ProblemRepository problemRepository;

    public BookmarkService(BookmarkRepository bookmarkRepository, ProblemRepository problemRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.problemRepository = problemRepository;
    }

    public BookmarkResponse addBookmark(AppUser user, Long problemId, String tag) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        Bookmark bookmark = bookmarkRepository.findByUserAndProblem(user, problem).orElse(new Bookmark());
        bookmark.setUser(user);
        bookmark.setProblem(problem);
        bookmark.setTag(tag == null || tag.isBlank() ? "Revise Later" : tag);

        return toResponse(bookmarkRepository.save(bookmark));
    }

    public void removeBookmark(AppUser user, Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        Bookmark bookmark = bookmarkRepository.findByUserAndProblem(user, problem)
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark not found"));

        bookmarkRepository.delete(bookmark);
    }

    public List<BookmarkResponse> getBookmarks(AppUser user) {
        return bookmarkRepository.findByUser(user).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<Long> getBookmarkIds(AppUser user) {
        return bookmarkRepository.findByUser(user).stream()
                .map(b -> b.getProblem().getId())
                .toList();
    }

    private BookmarkResponse toResponse(Bookmark bookmark) {
        Problem p = bookmark.getProblem();
        return new BookmarkResponse(
                bookmark.getId(),
                p.getId(),
                p.getTitle(),
                p.getCategory(),
                p.getDifficulty(),
                bookmark.getTag(),
                bookmark.getCreatedAt()
        );
    }
}
