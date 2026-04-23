import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import connectRedis from './config/redis.js';
import logger from './utils/logger.js';

const start = async () => {
  // Connect to MongoDB (required)
  await connectDB();

  // Connect to Redis (optional — app works without it)
  connectRedis();

  const server = app.listen(env.PORT, () => {
    logger.info(`
  ╔═══════════════════════════════════════════════╗
  ║  CareLink Bharat API                          ║
  ║  Environment: ${env.NODE_ENV.padEnd(30)}  ║
  ║  Port:        ${String(env.PORT).padEnd(30)}  ║
  ║  Health:      /api/v1/health                   ║
  ╚═══════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection:', err);
    shutdown('UNHANDLED_REJECTION');
  });
};

start();
