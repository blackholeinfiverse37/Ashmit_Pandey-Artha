import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import logger from './config/logger.js';
import {
  helmetConfig,
  limiter,
  sanitizeInput,
  watermark,
} from './middleware/security.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import ledgerRoutes from './routes/ledger.routes.js';
import accountsRoutes from './routes/accounts.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import legacyRoutes from './routes/index.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app = express();

// Security middleware
app.use(helmetConfig);
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(limiter);
app.use(watermark);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize inputs
app.use(sanitizeInput);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ARTHA API is running',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

// Mount routes - V1 API (Primary)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ledger', ledgerRoutes);
app.use('/api/v1/accounts', accountsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/invoices', invoiceRoutes);

// Legacy routes (Backward compatibility)
app.use('/api', legacyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server (only if not in test mode)
let server;
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

export default app;