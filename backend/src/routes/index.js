import express from 'express';
import authRoutes from './auth.js';
import authRoutesV1 from './auth.routes.js';
import ledgerRoutes from './ledger.routes.js';
import accountsRoutes from './accounts.routes.js';

const router = express.Router();

// Health check (legacy)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      traceId: req.traceId,
      version: '0.1.0'
    },
    message: 'API is healthy'
  });
});

// API routes - maintain backward compatibility
router.use('/auth', authRoutes);
router.use('/v1/auth', authRoutesV1);
router.use('/v1/ledger', ledgerRoutes);
router.use('/v1/accounts', accountsRoutes);

export default router;