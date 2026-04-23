import Redis from 'ioredis';
import env from './env.js';
import logger from '../utils/logger.js';

let redis = null;

const connectRedis = () => {
  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          logger.warn('Redis: max retries reached, running without cache');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.warn('Redis error:', err.message));
    redis.on('close', () => logger.warn('Redis connection closed'));

    redis.connect().catch(() => {
      logger.warn('Redis unavailable — cache disabled, app continues without it');
      redis = null;
    });
  } catch {
    logger.warn('Redis init failed — cache disabled');
    redis = null;
  }
};

export const getRedis = () => redis;
export default connectRedis;
