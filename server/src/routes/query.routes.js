import { Router } from 'express';
import {
  askQuery,
  verifyQuery,
  getHistory,
  updateProgress,
  clearHistory,
} from '../controllers/query.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { queryLimiter } from '../middleware/rateLimiter.js';
import validate from '../middleware/validate.js';
import { askQuerySchema, verifyStepSchema, updateProgressSchema } from '../validators/query.validator.js';

const router = Router();

router.use(protect);

router.post('/ask', queryLimiter, validate(askQuerySchema), askQuery);
router.post('/verify', queryLimiter, validate(verifyStepSchema), verifyQuery);
router.get('/history', getHistory);
router.patch('/:id/progress', validate(updateProgressSchema), updateProgress);
router.delete('/history', clearHistory);

export default router;
