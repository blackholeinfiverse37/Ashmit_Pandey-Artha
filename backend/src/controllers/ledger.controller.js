import ledgerService from '../services/ledger.service.js';
import logger from '../config/logger.js';

// @desc    Create journal entry
// @route   POST /api/v1/ledger/entries
// @access  Private (accountant, admin)
export const createEntry = async (req, res) => {
  try {
    const entry = await ledgerService.createJournalEntry(req.body, req.user._id);

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    logger.error('Create entry error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Post journal entry
// @route   POST /api/v1/ledger/entries/:id/post
// @access  Private (accountant, admin)
export const postEntry = async (req, res) => {
  try {
    const entry = await ledgerService.postJournalEntry(req.params.id, req.user._id);

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    logger.error('Post entry error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get journal entries
// @route   GET /api/v1/ledger/entries
// @access  Private
export const getEntries = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      account: req.query.account,
      search: req.query.search,
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'date',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const result = await ledgerService.getJournalEntries(filters, pagination);

    res.json({
      success: true,
      data: result.entries,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Get entries error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single journal entry
// @route   GET /api/v1/ledger/entries/:id
// @access  Private
export const getEntry = async (req, res) => {
  try {
    const entry = await ledgerService.getJournalEntryById(req.params.id);

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    logger.error('Get entry error:', error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Void journal entry
// @route   POST /api/v1/ledger/entries/:id/void
// @access  Private (accountant, admin)
export const voidEntry = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason for voiding is required',
      });
    }

    const result = await ledgerService.voidJournalEntry(req.params.id, req.user._id, reason);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Void entry error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get account balances
// @route   GET /api/v1/ledger/balances
// @access  Private
export const getBalances = async (req, res) => {
  try {
    const filters = {
      accountType: req.query.accountType,
      minBalance: req.query.minBalance,
      maxBalance: req.query.maxBalance,
      search: req.query.search,
    };

    const balances = await ledgerService.getAccountBalances(filters);

    res.json({
      success: true,
      data: balances,
    });
  } catch (error) {
    logger.error('Get balances error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get ledger summary
// @route   GET /api/v1/ledger/summary
// @access  Private
export const getSummary = async (req, res) => {
  try {
    const summary = await ledgerService.getLedgerSummary();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify ledger chain integrity
// @route   GET /api/v1/ledger/verify
// @access  Private (admin)
export const verifyChain = async (req, res) => {
  try {
    const result = await ledgerService.verifyLedgerChain();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Verify chain error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};