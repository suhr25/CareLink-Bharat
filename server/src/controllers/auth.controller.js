import passport from 'passport';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  isRefreshTokenValid,
} from '../services/token.service.js';
import env from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  domain: env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const sendTokenResponse = async (res, user, statusCode = 200) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  return apiResponse(res, statusCode, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      authProvider: user.authProvider,
      preferredLang: user.preferredLang,
      role: user.role,
    },
    accessToken,
  });
};

// POST /auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.validated;

  const existing = await User.findOne({
    $or: [{ email }, ...(username ? [{ username }] : [])],
  });

  if (existing) {
    throw new AppError(
      existing.email === email ? 'Email already registered' : 'Username already taken',
      409
    );
  }

  const user = await User.create({
    name,
    email,
    username,
    password,
    authProvider: 'local',
  });

  await sendTokenResponse(res, user, 201);
});

// POST /auth/login
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.validated;

  const user = await User.findOne({
    $or: [{ email: username }, { username }],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.authProvider === 'google' && !user.password) {
    throw new AppError('This account uses Google sign-in. Please use Google to log in.', 400);
  }

  await sendTokenResponse(res, user);
});

// GET /auth/google
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

// GET /auth/google/callback
export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      const errorMsg = encodeURIComponent(err?.message || 'Authentication failed');
      return res.redirect(`${env.CLIENT_URL}/login?error=${errorMsg}`);
    }

    try {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = await generateRefreshToken(user._id);

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

      // Redirect to frontend with access token
      res.redirect(`${env.CLIENT_URL}/auth/callback?token=${accessToken}`);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

// POST /auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError('No refresh token provided', 401);
  }

  const isValid = await isRefreshTokenValid(token);
  if (!isValid) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('User not found', 401);
  }

  // Rotate: revoke old, issue new
  await revokeRefreshToken(token);
  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = await generateRefreshToken(user._id);

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

  return apiResponse(res, 200, { accessToken: newAccessToken }, 'Token refreshed');
});

// POST /auth/logout
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    await revokeRefreshToken(token);
  }

  res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, maxAge: 0 });

  return apiResponse(res, 200, null, 'Logged out successfully');
});

// GET /auth/me
export const getMe = asyncHandler(async (req, res) => {
  return apiResponse(res, 200, { user: req.user });
});
