import { Router } from 'express';
import { getProfile, updateProfile, updatePreferences } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema, updatePreferencesSchema } from '../validators/user.validator.js';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.patch('/preferences', validate(updatePreferencesSchema), updatePreferences);

export default router;
