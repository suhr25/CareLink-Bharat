import { Router } from 'express';
import { submitFeedback } from '../controllers/feedback.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js';
import { feedbackSchema } from '../validators/query.validator.js';

const router = Router();

router.use(protect);

router.post('/', validate(feedbackSchema), submitFeedback);

export default router;
