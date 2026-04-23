import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import env from './config/env.js';
import configurePassport from './config/passport.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import queryRoutes from './routes/query.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';

const app = express();

// ── Security ──
app.use(helmet());
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(globalLimiter);

// ── Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Logging ──
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Passport ──
configurePassport();
app.use(passport.initialize());

// ── Health Check ──
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// ── API Routes (v1) ──
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/query', queryRoutes);
app.use('/api/v1/feedback', feedbackRoutes);

// ── 404 ──
app.all('*', (req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

// ── Error Handler ──
app.use(errorHandler);

export default app;
