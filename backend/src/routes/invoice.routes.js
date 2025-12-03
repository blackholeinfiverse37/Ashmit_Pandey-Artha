import express from 'express';
import { body } from 'express-validator';
import {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  sendInvoice,
  recordPayment,
  cancelInvoice,
  getInvoiceStats,
} from '../controllers/invoice.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, auditLogger } from '../middleware/security.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Validation rules
const invoiceValidation = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('invoiceDate').isISO8601().withMessage('Valid invoice date required'),
  body('dueDate').isISO8601().withMessage('Valid due date required'),
  body('lines').isArray({ min: 1 }).withMessage('At least 1 line item required'),
];

const paymentValidation = [
  body('amount').isNumeric().withMessage('Payment amount is required'),
  body('paymentMethod')
    .isIn(['cash', 'bank_transfer', 'check', 'card', 'upi', 'other'])
    .withMessage('Valid payment method required'),
];

// All routes require authentication
router.use(protect);

// Routes
router.route('/stats').get(cacheMiddleware(900), getInvoiceStats);

router
  .route('/')
  .get(cacheMiddleware(300), getInvoices)
  .post(
    authorize('accountant', 'admin'),
    invoiceValidation,
    validate,
    auditLogger('invoice.created', 'Invoice'),
    createInvoice
  );

router
  .route('/:id')
  .get(cacheMiddleware(600), getInvoice)
  .put(
    authorize('accountant', 'admin'),
    validate,
    auditLogger('invoice.updated', 'Invoice'),
    updateInvoice
  );

router
  .route('/:id/send')
  .post(
    authorize('accountant', 'admin'),
    auditLogger('invoice.sent', 'Invoice'),
    sendInvoice
  );

router
  .route('/:id/payment')
  .post(
    authorize('accountant', 'admin'),
    paymentValidation,
    validate,
    auditLogger('invoice.payment_recorded', 'Invoice'),
    recordPayment
  );

router
  .route('/:id/cancel')
  .post(
    authorize('accountant', 'admin'),
    auditLogger('invoice.cancelled', 'Invoice'),
    cancelInvoice
  );

export default router;