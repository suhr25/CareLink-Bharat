import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  username: z.string().trim().min(3).max(30).toLowerCase().optional(),
  profilePicture: z.string().url().optional(),
});

export const updatePreferencesSchema = z.object({
  preferredLang: z.enum(['en-IN', 'hi-IN']),
});
