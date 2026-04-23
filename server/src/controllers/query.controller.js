import QueryHistory from '../models/QueryHistory.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { generateSteps, verifyStep } from '../services/groq.service.js';
import { getCachedQuery, setCachedQuery } from '../services/cache.service.js';

// POST /query/ask
export const askQuery = asyncHandler(async (req, res) => {
  const { query, language } = req.validated;

  // Check cache first
  const cached = await getCachedQuery(query, language);
  let steps;

  if (cached) {
    steps = cached;
  } else {
    steps = await generateSteps(query, language);
    await setCachedQuery(query, language, steps, 3600);
  }

  // Persist to history
  const record = await QueryHistory.create({
    userId: req.user._id,
    query,
    language,
    steps: steps.map((text) => ({ text, completed: false })),
  });

  return apiResponse(res, 200, {
    queryId: record._id,
    steps,
    cached: !!cached,
  });
});

// POST /query/verify
export const verifyQuery = asyncHandler(async (req, res) => {
  const { stepText } = req.validated;

  const result = await verifyStep(stepText);

  return apiResponse(res, 200, { verification: result });
});

// GET /query/history
export const getHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    QueryHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    QueryHistory.countDocuments({ userId: req.user._id }),
  ]);

  return apiResponse(res, 200, {
    history,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// PATCH /query/:id/progress
export const updateProgress = asyncHandler(async (req, res) => {
  const { stepIndex, completed } = req.validated;

  const record = await QueryHistory.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!record) {
    throw new AppError('Query not found', 404);
  }

  if (stepIndex >= record.steps.length) {
    throw new AppError('Invalid step index', 400);
  }

  record.steps[stepIndex].completed = completed;

  const allDone = record.steps.every((s) => s.completed);
  record.completed = allDone;

  await record.save();

  return apiResponse(res, 200, { record }, 'Progress updated');
});

// DELETE /query/history
export const clearHistory = asyncHandler(async (req, res) => {
  await QueryHistory.deleteMany({ userId: req.user._id });
  return apiResponse(res, 200, null, 'History cleared');
});
