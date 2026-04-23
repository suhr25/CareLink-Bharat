import crypto from 'crypto';
import { getRedis } from '../config/redis.js';
import logger from '../utils/logger.js';

const DEFAULT_TTL = 3600; // 1 hour

const hashKey = (query, language) => {
  const raw = `${query.toLowerCase().trim()}:${language}`;
  return `cl:query:${crypto.createHash('sha256').update(raw).digest('hex')}`;
};

export const getCachedQuery = async (query, language) => {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const key = hashKey(query, language);
    const cached = await redis.get(key);
    if (cached) {
      logger.debug(`Cache HIT: ${key.slice(0, 20)}...`);
      return JSON.parse(cached);
    }
    return null;
  } catch (err) {
    logger.warn('Cache read error:', err.message);
    return null;
  }
};

export const setCachedQuery = async (query, language, steps, ttl = DEFAULT_TTL) => {
  const redis = getRedis();
  if (!redis) return;

  try {
    const key = hashKey(query, language);
    await redis.set(key, JSON.stringify(steps), 'EX', ttl);
    logger.debug(`Cache SET: ${key.slice(0, 20)}...`);
  } catch (err) {
    logger.warn('Cache write error:', err.message);
  }
};

export const invalidateCache = async (query, language) => {
  const redis = getRedis();
  if (!redis) return;

  try {
    const key = hashKey(query, language);
    await redis.del(key);
  } catch (err) {
    logger.warn('Cache invalidation error:', err.message);
  }
};
