import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';

// GET /user/profile
export const getProfile = asyncHandler(async (req, res) => {
  return apiResponse(res, 200, { user: req.user });
});

// PATCH /user/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, username, profilePicture } = req.validated;

  if (username && username !== req.user.username) {
    const exists = await User.findOne({ username, _id: { $ne: req.user._id } });
    if (exists) {
      throw new AppError('Username already taken', 409);
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...(name && { name }), ...(username && { username }), ...(profilePicture && { profilePicture }) },
    { new: true, runValidators: true }
  );

  return apiResponse(res, 200, { user }, 'Profile updated');
});

// PATCH /user/preferences
export const updatePreferences = asyncHandler(async (req, res) => {
  const { preferredLang } = req.validated;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { preferredLang },
    { new: true, runValidators: true }
  );

  return apiResponse(res, 200, { user }, 'Preferences updated');
});
