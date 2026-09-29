import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler as h } from '../utils/http.js';
import * as auth from '../controllers/auth.controller.js';
import * as problems from '../controllers/problem.controller.js';
import * as progress from '../controllers/progress.controller.js';
import * as notes from '../controllers/note.controller.js';
import * as bookmarks from '../controllers/bookmark.controller.js';
import * as execution from '../controllers/execution.controller.js';

const router = Router();

const limiter = (max, message) =>
  rateLimit({ windowMs: 60_000, max, standardHeaders: true, legacyHeaders: false, message: { message } });

// Auth
router.post('/auth/register', limiter(20, 'Too many sign-up attempts, try again in a minute'), h(auth.register));
router.post('/auth/login', limiter(20, 'Too many login attempts, try again in a minute'), h(auth.login));
router.get('/auth/profile', authenticate, h(auth.profile));

// Problems (read is public, write is admin only)
router.get('/problems', h(problems.listProblems));
router.get('/problems/categories', h(problems.listCategories));
router.get('/problems/:id', h(problems.getProblem));
router.post('/problems', authenticate, requireAdmin, h(problems.createProblem));
router.put('/problems/:id', authenticate, requireAdmin, h(problems.updateProblem));
router.delete('/problems/:id', authenticate, requireAdmin, h(problems.deleteProblem));

// Progress
router.post('/progress/solved/:problemId', authenticate, h(progress.markSolved));
router.get('/progress/solved-ids', authenticate, h(progress.solvedIds));
router.get('/progress/stats', authenticate, h(progress.stats));

// Notes
router.get('/notes', authenticate, h(notes.listNotes));
router.get('/notes/:problemId', authenticate, h(notes.getNote));
router.post('/notes/:problemId', authenticate, h(notes.saveNote));
router.delete('/notes/:problemId', authenticate, h(notes.deleteNote));

// Bookmarks
router.get('/bookmarks', authenticate, h(bookmarks.listBookmarks));
router.get('/bookmarks/ids', authenticate, h(bookmarks.bookmarkIds));
router.post('/bookmarks/:problemId', authenticate, h(bookmarks.addBookmark));
router.delete('/bookmarks/:problemId', authenticate, h(bookmarks.removeBookmark));

// Java code execution (guests can run code; only logged-in users get progress)
router.post('/execution/run', limiter(15, 'Too many runs, wait a moment and try again'), optionalAuth, h(execution.runCode));

export default router;
