import Feedback from '../models/Feedback.js';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';

// POST /feedback
export const submitFeedback = asyncHandler(async (req, res) => {
  const { queryId, rating, comment } = req.validated;

  const feedback = await Feedback.create({
    userId: req.user._id,
    queryId: queryId || undefined,
    rating,
    comment,
  });

  return apiResponse(res, 201, { feedback }, 'Feedback submitted');
});
