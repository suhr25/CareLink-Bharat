import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import RefreshToken from '../models/RefreshToken.js';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = async (userId) => {
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN;
  const token = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn });

  const ms = parseDuration(expiresIn);
  await RefreshToken.create({
    userId,
    token,
    expiresAt: new Date(Date.now() + ms),
  });

  return token;
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

export const revokeRefreshToken = async (token) => {
  await RefreshToken.findOneAndUpdate({ token }, { revoked: true });
};

export const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany({ userId, revoked: false }, { revoked: true });
};

export const isRefreshTokenValid = async (token) => {
  const doc = await RefreshToken.findOne({ token, revoked: false });
  if (!doc) return false;
  if (doc.expiresAt < new Date()) return false;
  return true;
};

function parseDuration(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return val * (multipliers[unit] || 86400000);
}
