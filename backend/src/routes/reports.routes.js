import express from 'express';
import { exportGeneralLedger } from '../controllers/pdf.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/general-ledger').get(exportGeneralLedger);

export default router;