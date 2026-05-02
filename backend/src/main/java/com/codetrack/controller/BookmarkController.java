package com.codetrack.controller;

import com.codetrack.dto.BookmarkRequest;
import com.codetrack.dto.BookmarkResponse;
import com.codetrack.model.AppUser;
import com.codetrack.service.BookmarkService;
import com.codetrack.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {
    private final BookmarkService bookmarkService;
    private final UserService userService;

    public BookmarkController(BookmarkService bookmarkService, UserService userService) {
        this.bookmarkService = bookmarkService;
        this.userService = userService;
    }

    @PostMapping("/{problemId}")
    public BookmarkResponse add(@AuthenticationPrincipal UserDetails userDetails,
                                @PathVariable Long problemId,
                                @RequestBody(required = false) BookmarkRequest request) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        String tag = request == null ? "Revise Later" : request.getTag();
        return bookmarkService.addBookmark(user, problemId, tag);
    }

    @GetMapping
    public List<BookmarkResponse> getAll(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        return bookmarkService.getBookmarks(user);
    }

    @GetMapping("/ids")
    public List<Long> ids(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        return bookmarkService.getBookmarkIds(user);
    }

    @DeleteMapping("/{problemId}")
    public void delete(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long problemId) {
        AppUser user = userService.getByEmail(userDetails.getUsername());
        bookmarkService.removeBookmark(user, problemId);
    }
}
