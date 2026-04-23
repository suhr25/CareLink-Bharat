import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  if (!env.MONGODB_URI) {
    logger.warn('⚠️  MONGODB_URI not set — database features disabled. Set it in .env to enable.');
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnect...');
    });
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;
