import Decimal from 'decimal.js';
import JournalEntry from '../models/JournalEntry.js';
import AccountBalance from '../models/AccountBalance.js';
import ChartOfAccounts from '../models/ChartOfAccounts.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';
import mongoose from 'mongoose';

class LedgerService {
  /**
   * Validate double-entry: debits must equal credits
   */
  validateDoubleEntry(lines) {
    let totalDebits = new Decimal(0);
    let totalCredits = new Decimal(0);

    lines.forEach(line => {
      totalDebits = totalDebits.plus(new Decimal(line.debit || 0));
      totalCredits = totalCredits.plus(new Decimal(line.credit || 0));
    });

    if (!totalDebits.equals(totalCredits)) {
      throw new Error(
        `Double-entry validation failed: Debits (${totalDebits.toString()}) != Credits (${totalCredits.toString()})`
      );
    }

    return true;
  }

  /**
   * Validate that each line has only debit OR credit (not both)
   */
  validateLineIntegrity(lines) {
    lines.forEach((line, index) => {
      const debit = new Decimal(line.debit || 0);
      const credit = new Decimal(line.credit || 0);

      if (!debit.isZero() && !credit.isZero()) {
        throw new Error(`Line ${index + 1}: Cannot have both debit and credit`);
      }

      if (debit.isZero() && credit.isZero()) {
        throw new Error(`Line ${index + 1}: Must have either debit or credit`);
      }

      if (debit.isNegative() || credit.isNegative()) {
        throw new Error(`Line ${index + 1}: Amounts cannot be negative`);
      }
    });

    return true;
  }

  /**
   * Validate that all accounts exist and are active
   */
  async validateAccounts(lines) {
    const accountIds = lines.map(line => line.account);
    const accounts = await ChartOfAccounts.find({
      _id: { $in: accountIds },
      isActive: true,
    });

    if (accounts.length !== accountIds.length) {
      throw new Error('One or more accounts are invalid or inactive');
    }

    return accounts;
  }

  /**
   * Get the previous hash for chain continuity
   */
  async getPreviousHash() {
    const lastEntry = await JournalEntry.findOne({ status: 'posted' })
      .sort({ createdAt: -1 })
      .select('immutable_hash');

    return lastEntry ? lastEntry.immutable_hash : '0';
  }

  /**
   * Create a new journal entry (with transaction support)
   */
  async createJournalEntry(entryData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { date, description, lines, reference, tags } = entryData;

      // Validations
      this.validateLineIntegrity(lines);
      this.validateDoubleEntry(lines);
      await this.validateAccounts(lines);

      // Get previous hash for chain
      const prevHash = await this.getPreviousHash();

      // Create journal entry
      const journalEntry = new JournalEntry({
        date: date || new Date(),
        description,
        lines,
        reference,
        tags,
        status: 'draft',
        prev_hash: prevHash,
        immutable_hash: '', // Will be calculated in pre-save hook
      });

      await journalEntry.save({ session });

      // Commit transaction
      await session.commitTransaction();
      
      logger.info(`Journal entry created: ${journalEntry.entryNumber}`);

      return journalEntry;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Create journal entry error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Post a journal entry (make it permanent and update balances)
   */
  async postJournalEntry(entryId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const entry = await JournalEntry.findById(entryId).session(session);

      if (!entry) {
        throw new Error('Journal entry not found');
      }

      if (entry.status === 'posted') {
        throw new Error('Journal entry is already posted');
      }

      if (entry.status === 'voided') {
        throw new Error('Cannot post a voided entry');
      }

      // Re-validate before posting
      this.validateLineIntegrity(entry.lines);
      this.validateDoubleEntry(entry.lines);

      // Update entry status
      entry.status = 'posted';
      entry.postedBy = userId;
      entry.postedAt = new Date();
      
      // Hash will be recalculated in pre-save hook
      await entry.save({ session });

      // Update account balances
      await this.updateAccountBalances(entry.lines, session);

      await session.commitTransaction();
      
      logger.info(`Journal entry posted: ${entry.entryNumber} by user ${userId}`);

      return entry;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Post journal entry error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Update account balances based on journal entry lines
   */
  async updateAccountBalances(lines, session) {
    for (const line of lines) {
      const debit = new Decimal(line.debit || 0);
      const credit = new Decimal(line.credit || 0);

      // Find or create account balance
      let accountBalance = await AccountBalance.findOne({
        account: line.account,
      }).session(session);

      if (!accountBalance) {
        accountBalance = new AccountBalance({
          account: line.account,
          balance: '0',
          debitTotal: '0',
          creditTotal: '0',
        });
      }

      // Update totals
      const currentDebitTotal = new Decimal(accountBalance.debitTotal);
      const currentCreditTotal = new Decimal(accountBalance.creditTotal);

      accountBalance.debitTotal = currentDebitTotal.plus(debit).toString();
      accountBalance.creditTotal = currentCreditTotal.plus(credit).toString();

      // Calculate net balance (debit - credit)
      const netBalance = new Decimal(accountBalance.debitTotal).minus(
        new Decimal(accountBalance.creditTotal)
      );
      accountBalance.balance = netBalance.toString();
      accountBalance.lastUpdated = new Date();

      await accountBalance.save({ session });
    }
  }

  /**
   * Get journal entries with pagination and filters
   */
  async getJournalEntries(filters = {}, pagination = {}) {
    const {
      status,
      dateFrom,
      dateTo,
      account,
      search,
    } = filters;

    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = pagination;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    if (account) {
      query['lines.account'] = account;
    }

    if (search) {
      query.$or = [
        { entryNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [entries, total] = await Promise.all([
      JournalEntry.find(query)
        .populate('lines.account', 'code name type')
        .populate('postedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      JournalEntry.countDocuments(query),
    ]);

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single journal entry by ID
   */
  async getJournalEntryById(entryId) {
    const entry = await JournalEntry.findById(entryId)
      .populate('lines.account', 'code name type normalBalance')
      .populate('postedBy', 'name email');

    if (!entry) {
      throw new Error('Journal entry not found');
    }

    return entry;
  }

  /**
   * Verify the integrity of the ledger chain
   */
  async verifyLedgerChain() {
    const entries = await JournalEntry.find({ status: 'posted' }).sort({
      createdAt: 1,
    });

    const errors = [];
    let prevHash = '0';

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Check if prev_hash matches
      if (entry.prev_hash !== prevHash) {
        errors.push({
          entryNumber: entry.entryNumber,
          error: 'Chain broken: prev_hash mismatch',
          expected: prevHash,
          actual: entry.prev_hash,
        });
      }

      // Recalculate hash and verify
      const calculatedHash = entry.calculateHash();
      if (entry.immutable_hash !== calculatedHash) {
        errors.push({
          entryNumber: entry.entryNumber,
          error: 'Hash mismatch: entry may have been tampered with',
          expected: calculatedHash,
          actual: entry.immutable_hash,
        });
      }

      prevHash = entry.immutable_hash;
    }

    return {
      isValid: errors.length === 0,
      totalEntries: entries.length,
      errors,
    };
  }

  /**
   * Get account balances with optional filters
   */
  async getAccountBalances(filters = {}) {
    const { accountType, minBalance, maxBalance, search } = filters;

    const pipeline = [
      {
        $lookup: {
          from: 'chartofaccounts',
          localField: 'account',
          foreignField: '_id',
          as: 'accountDetails',
        },
      },
      {
        $unwind: '$accountDetails',
      },
    ];

    // Add filters
    const matchStage = { 'accountDetails.isActive': true };

    if (accountType) {
      matchStage['accountDetails.type'] = accountType;
    }

    if (search) {
      matchStage.$or = [
        { 'accountDetails.name': { $regex: search, $options: 'i' } },
        { 'accountDetails.code': { $regex: search, $options: 'i' } },
      ];
    }

    pipeline.push({ $match: matchStage });

    // Filter by balance range (convert to number for comparison)
    if (minBalance !== undefined || maxBalance !== undefined) {
      pipeline.push({
        $addFields: {
          balanceNum: { $toDouble: '$balance' },
        },
      });

      const balanceFilter = {};
      if (minBalance !== undefined) balanceFilter.$gte = parseFloat(minBalance);
      if (maxBalance !== undefined) balanceFilter.$lte = parseFloat(maxBalance);

      pipeline.push({
        $match: { balanceNum: balanceFilter },
      });
    }

    // Project final shape
    pipeline.push({
      $project: {
        account: '$accountDetails._id',
        accountCode: '$accountDetails.code',
        accountName: '$accountDetails.name',
        accountType: '$accountDetails.type',
        normalBalance: '$accountDetails.normalBalance',
        balance: 1,
        debitTotal: 1,
        creditTotal: 1,
        lastUpdated: 1,
      },
    });

    // Sort by account code
    pipeline.push({ $sort: { accountCode: 1 } });

    const balances = await AccountBalance.aggregate(pipeline);

    return balances;
  }

  /**
   * Get ledger summary (total assets, liabilities, equity, income, expenses)
   */
  async getLedgerSummary() {
    const balances = await this.getAccountBalances();

    const summary = {
      assets: new Decimal(0),
      liabilities: new Decimal(0),
      equity: new Decimal(0),
      income: new Decimal(0),
      expenses: new Decimal(0),
    };

    balances.forEach((balance) => {
      const amount = new Decimal(balance.balance);
      const type = balance.accountType.toLowerCase();

      switch (type) {
        case 'asset':
          summary.assets = summary.assets.plus(amount);
          break;
        case 'liability':
          summary.liabilities = summary.liabilities.plus(amount);
          break;
        case 'equity':
          summary.equity = summary.equity.plus(amount);
          break;
        case 'income':
          summary.income = summary.income.plus(amount);
          break;
        case 'expense':
          summary.expenses = summary.expenses.plus(amount);
          break;
      }
    });

    // Calculate net income
    const netIncome = summary.income.minus(summary.expenses);

    // Accounting equation check: Assets = Liabilities + Equity + Net Income
    const leftSide = summary.assets;
    const rightSide = summary.liabilities.plus(summary.equity).plus(netIncome);
    const isBalanced = leftSide.equals(rightSide);

    return {
      assets: summary.assets.toString(),
      liabilities: summary.liabilities.toString(),
      equity: summary.equity.toString(),
      income: summary.income.toString(),
      expenses: summary.expenses.toString(),
      netIncome: netIncome.toString(),
      isBalanced,
      balanceDifference: leftSide.minus(rightSide).toString(),
    };
  }

  /**
   * Void a journal entry (creates reversing entry)
   */
  async voidJournalEntry(entryId, userId, reason) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const entry = await JournalEntry.findById(entryId).session(session);

      if (!entry) {
        throw new Error('Journal entry not found');
      }

      if (entry.status !== 'posted') {
        throw new Error('Only posted entries can be voided');
      }

      if (entry.status === 'voided') {
        throw new Error('Entry is already voided');
      }

      // Mark original entry as voided
      entry.status = 'voided';
      await entry.save({ session });

      // Create reversing entry
      const reversingLines = entry.lines.map((line) => ({
        account: line.account,
        debit: line.credit, // Swap debit and credit
        credit: line.debit,
        description: `VOID: ${line.description || ''}`,
      }));

      const reversingEntry = new JournalEntry({
        date: new Date(),
        description: `VOID: ${entry.description} (Reason: ${reason})`,
        lines: reversingLines,
        reference: `VOID-${entry.entryNumber}`,
        status: 'posted',
        postedBy: userId,
        postedAt: new Date(),
        prev_hash: await this.getPreviousHash(),
        immutable_hash: '', // Will be calculated in pre-save hook
      });

      await reversingEntry.save({ session });

      // Update account balances with reversing entry
      await this.updateAccountBalances(reversingLines, session);

      await session.commitTransaction();

      logger.info(`Journal entry voided: ${entry.entryNumber} by user ${userId}`);

      return { voidedEntry: entry, reversingEntry };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Void journal entry error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new LedgerService();