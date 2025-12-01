import express from 'express';
import invoiceService from '../services/invoice.service.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Validation schemas
const createInvoiceValidation = [
  body('invoiceNumber').notEmpty().withMessage('Invoice number is required'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid email is required'),
  body('invoiceDate').isISO8601().withMessage('Valid invoice date is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isNumeric().withMessage('Item quantity must be numeric'),
  body('items.*.unitPrice').notEmpty().withMessage('Unit price is required'),
  body('items.*.amount').notEmpty().withMessage('Item amount is required'),
  body('subtotal').notEmpty().withMessage('Subtotal is required'),
  body('totalAmount').notEmpty().withMessage('Total amount is required'),
];

const recordPaymentValidation = [
  body('amount').notEmpty().withMessage('Payment amount is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('paymentDate').optional().isISO8601().withMessage('Valid payment date required'),
];

// Apply authentication to all routes
router.use(protect);

/**
 * @route   GET /api/v1/invoices
 * @desc    Get all invoices with filters
 * @access  Private (Admin/Accountant/Manager)
 */
router.get('/', authorize('admin', 'accountant', 'manager'), async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      customerName: req.query.customerName,
      search: req.query.search,
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'invoiceDate',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const result = await invoiceService.getInvoices(filters, pagination);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/v1/invoices/stats
 * @desc    Get invoice statistics
 * @access  Private (Admin/Accountant/Manager)
 */
router.get('/stats', authorize('admin', 'accountant', 'manager'), async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const stats = await invoiceService.getInvoiceStats(dateFrom, dateTo);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/v1/invoices/:id
 * @desc    Get single invoice
 * @access  Private (Admin/Accountant/Manager)
 */
router.get('/:id', 
  param('id').isMongoId().withMessage('Valid invoice ID required'),
  validateRequest,
  authorize('admin', 'accountant', 'manager'),
  async (req, res) => {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/v1/invoices
 * @desc    Create new invoice
 * @access  Private (Admin/Accountant)
 */
router.post('/',
  createInvoiceValidation,
  validateRequest,
  authorize('admin', 'accountant'),
  async (req, res) => {
    try {
      const invoice = await invoiceService.createInvoice(req.body, req.user.id);

      res.status(201).json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   PUT /api/v1/invoices/:id
 * @desc    Update invoice
 * @access  Private (Admin/Accountant)
 */
router.put('/:id',
  param('id').isMongoId().withMessage('Valid invoice ID required'),
  validateRequest,
  authorize('admin', 'accountant'),
  async (req, res) => {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id, req.body);

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/v1/invoices/:id/send
 * @desc    Send invoice (creates AR journal entry)
 * @access  Private (Admin/Accountant)
 */
router.post('/:id/send',
  param('id').isMongoId().withMessage('Valid invoice ID required'),
  validateRequest,
  authorize('admin', 'accountant'),
  async (req, res) => {
    try {
      const invoice = await invoiceService.sendInvoice(req.params.id, req.user.id);

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice sent successfully',
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/v1/invoices/:id/payment
 * @desc    Record payment for invoice
 * @access  Private (Admin/Accountant)
 */
router.post('/:id/payment',
  param('id').isMongoId().withMessage('Valid invoice ID required'),
  recordPaymentValidation,
  validateRequest,
  authorize('admin', 'accountant'),
  async (req, res) => {
    try {
      const invoice = await invoiceService.recordPayment(
        req.params.id,
        req.body,
        req.user.id
      );

      res.json({
        success: true,
        data: invoice,
        message: 'Payment recorded successfully',
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * @route   POST /api/v1/invoices/:id/cancel
 * @desc    Cancel invoice
 * @access  Private (Admin/Accountant)
 */
router.post('/:id/cancel',
  param('id').isMongoId().withMessage('Valid invoice ID required'),
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
  validateRequest,
  authorize('admin', 'accountant'),
  async (req, res) => {
    try {
      const invoice = await invoiceService.cancelInvoice(
        req.params.id,
        req.body.reason,
        req.user.id
      );

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice cancelled successfully',
      });
    } catch (error) {
      const statusCode = error.message === 'Invoice not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;