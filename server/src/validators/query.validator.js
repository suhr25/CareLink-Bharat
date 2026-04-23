import { z } from 'zod';

export const askQuerySchema = z.object({
  query: z.string().trim().min(1, 'Query is required').max(1000),
  language: z.enum(['en-IN', 'hi-IN']).default('en-IN'),
});

export const verifyStepSchema = z.object({
  stepText: z.string().trim().min(1, 'Step text is required').max(2000),
});

export const updateProgressSchema = z.object({
  stepIndex: z.number().int().min(0),
  completed: z.boolean(),
});

export const feedbackSchema = z.object({
  queryId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});
