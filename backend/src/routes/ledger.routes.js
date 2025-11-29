import express from 'express';
import { body } from 'express-validator';
import {
  createEntry,
  postEntry,
  getEntries,
  getEntry,
  voidEntry,
  getBalances,
  getSummary,
  verifyChain,
} from '../controllers/ledger.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate, auditLogger } from '../middleware/security.js';

const router = express.Router();

// Validation rules
const createEntryValidation = [
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('lines').isArray({ min: 2 }).withMessage('At least 2 lines required'),
  body('lines.*.account').isMongoId().withMessage('Valid account ID required'),
  body('lines.*.debit').optional().isNumeric().withMessage('Debit must be a number'),
  body('lines.*.credit').optional().isNumeric().withMessage('Credit must be a number'),
];

const voidEntryValidation = [
  body('reason').trim().notEmpty().withMessage('Reason for voiding is required'),
];

// All routes require authentication
router.use(protect);

// Routes
router
  .route('/entries')
  .get(getEntries)
  .post(
    authorize('accountant', 'admin'),
    createEntryValidation,
    validate,
    auditLogger('journal_entry.created', 'JournalEntry'),
    createEntry
  );

router
  .route('/entries/:id')
  .get(getEntry);

router
  .route('/entries/:id/post')
  .post(
    authorize('accountant', 'admin'),
    auditLogger('journal_entry.posted', 'JournalEntry'),
    postEntry
  );

router
  .route('/entries/:id/void')
  .post(
    authorize('accountant', 'admin'),
    voidEntryValidation,
    validate,
    auditLogger('journal_entry.voided', 'JournalEntry'),
    voidEntry
  );

router.route('/balances').get(getBalances);

router.route('/summary').get(getSummary);

router.route('/verify').get(authorize('admin'), verifyChain);

// Legacy routes for backward compatibility
router.get('/journal-entries', getEntries);
router.post('/journal-entries', authorize('accountant', 'admin'), createEntryValidation, validate, auditLogger('journal_entry.created', 'JournalEntry'), createEntry);
router.get('/journal-entries/:id', getEntry);
router.post('/journal-entries/:id/post', authorize('accountant', 'admin'), auditLogger('journal_entry.posted', 'JournalEntry'), postEntry);
router.post('/journal-entries/:id/void', authorize('accountant', 'admin'), voidEntryValidation, validate, auditLogger('journal_entry.voided', 'JournalEntry'), voidEntry);
router.get('/verify-chain', authorize('admin'), verifyChain);

export default router;