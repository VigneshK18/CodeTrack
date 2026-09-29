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
router.get('/problems/random', h(problems.randomProblem));
router.get('/problems/:id', optionalAuth, h(problems.getProblem));
router.post('/problems', authenticate, requireAdmin, h(problems.createProblem));
router.put('/problems/:id', authenticate, requireAdmin, h(problems.updateProblem));
router.delete('/problems/:id', authenticate, requireAdmin, h(problems.deleteProblem));

// Progress
router.get('/progress/solved-ids', authenticate, h(progress.solvedIds));
router.get('/progress/stats', authenticate, h(progress.stats));
router.get('/progress/statuses', authenticate, h(progress.statuses));

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

// Judge: Run checks the examples (or custom inputs); Submit checks every test case and is saved
const judgeLimit = rateLimit({
  windowMs: 60_000,
  max: Number(process.env.JUDGE_RATE_LIMIT || 15), // runs + submissions per user per minute
  keyGenerator: (req) => `user:${req.user?.id}`,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many runs, wait a moment and try again' }
});
router.post('/execution/run', authenticate, judgeLimit, h(execution.runCode));
router.post('/execution/expected', authenticate, requireAdmin, judgeLimit, h(execution.generateExpected));
router.post('/submissions', authenticate, judgeLimit, h(execution.submitCode));
router.get('/submissions', authenticate, h(execution.listSubmissions));
router.get('/submissions/:id', authenticate, h(execution.getSubmission));

export default router;
