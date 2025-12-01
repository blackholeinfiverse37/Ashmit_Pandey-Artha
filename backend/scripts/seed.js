import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import chartOfAccountsService from '../src/services/chartOfAccounts.service.js';
import ledgerService from '../src/services/ledger.service.js';
import logger from '../src/config/logger.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Database connected');

    // Clear existing data (development only!)
    if (process.env.NODE_ENV === 'development') {
      await User.deleteMany({});
      await mongoose.connection.db.dropDatabase();
      logger.info('Existing data cleared');
    }

    // Create admin user
    const admin = await User.create({
      email: process.env.ADMIN_EMAIL || 'admin@artha.local',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      name: 'Admin User',
      role: 'admin',
    });
    logger.info(`Admin user created: ${admin.email}`);

    // Create accountant user
    const accountant = await User.create({
      email: 'accountant@artha.local',
      password: 'Accountant@123',
      name: 'Accountant User',
      role: 'accountant',
    });
    logger.info(`Accountant user created: ${accountant.email}`);

    // Create viewer user (maintain backward compatibility)
    const viewer = await User.create({
      email: 'user@example.com',
      password: 'testuser123',
      name: 'Test User',
      role: 'viewer',
    });
    logger.info(`Viewer user created: ${viewer.email}`);

    // Seed chart of accounts
    await chartOfAccountsService.seedDefaultAccounts();

    // Get accounts for sample entries
    const ChartOfAccounts = mongoose.model('ChartOfAccounts');
    const cash = await ChartOfAccounts.findOne({ code: '1000' });
    const capital = await ChartOfAccounts.findOne({ code: '3000' });
    const salesRevenue = await ChartOfAccounts.findOne({ code: '4000' });
    const rentExpense = await ChartOfAccounts.findOne({ code: '6100' });
    const salariesExpense = await ChartOfAccounts.findOne({ code: '6000' });

    // Create sample journal entries
    // Entry 1: Initial capital investment
    const entry1 = await ledgerService.createJournalEntry(
      {
        date: new Date('2025-01-01'),
        description: 'Initial capital investment',
        lines: [
          { account: cash._id, debit: '100000', credit: '0', description: 'Cash received' },
          {
            account: capital._id,
            debit: '0',
            credit: '100000',
            description: "Owner's investment",
          },
        ],
        reference: 'INVEST-001',
        tags: ['capital', 'initial'],
      },
      admin._id
    );
    await ledgerService.postJournalEntry(entry1._id, admin._id);
    logger.info('Sample entry 1 created and posted');

    // Entry 2: Sales revenue
    const entry2 = await ledgerService.createJournalEntry(
      {
        date: new Date('2025-01-15'),
        description: 'Cash sales for January',
        lines: [
          { account: cash._id, debit: '25000', credit: '0', description: 'Cash received' },
          {
            account: salesRevenue._id,
            debit: '0',
            credit: '25000',
            description: 'Sales revenue',
          },
        ],
        reference: 'SALE-001',
        tags: ['revenue', 'cash-sale'],
      },
      accountant._id
    );
    await ledgerService.postJournalEntry(entry2._id, accountant._id);
    logger.info('Sample entry 2 created and posted');

    // Entry 3: Rent expense
    const entry3 = await ledgerService.createJournalEntry(
      {
        date: new Date('2025-01-31'),
        description: 'Monthly rent payment',
        lines: [
          {
            account: rentExpense._id,
            debit: '5000',
            credit: '0',
            description: 'Rent for January',
          },
          { account: cash._id, debit: '0', credit: '5000', description: 'Cash paid' },
        ],
        reference: 'RENT-JAN-2025',
        tags: ['expense', 'rent'],
      },
      accountant._id
    );
    await ledgerService.postJournalEntry(entry3._id, accountant._id);
    logger.info('Sample entry 3 created and posted');

    // Entry 4: Salaries expense
    const entry4 = await ledgerService.createJournalEntry(
      {
        date: new Date('2025-01-31'),
        description: 'Monthly salary payment',
        lines: [
          {
            account: salariesExpense._id,
            debit: '15000',
            credit: '0',
            description: 'Salaries for January',
          },
          { account: cash._id, debit: '0', credit: '15000', description: 'Cash paid' },
        ],
        reference: 'SAL-JAN-2025',
        tags: ['expense', 'salaries'],
      },
      accountant._id
    );
    await ledgerService.postJournalEntry(entry4._id, accountant._id);
    logger.info('Sample entry 4 created and posted');

    // Verify ledger chain
    const verification = await ledgerService.verifyLedgerChain();
    logger.info('Ledger chain verification:', verification);

    // Get summary
    const summary = await ledgerService.getLedgerSummary();
    logger.info('Ledger summary:', summary);

    logger.info('✅ Database seeded successfully!');
    logger.info('\nLogin credentials:');
    logger.info('Admin: admin@artha.local / Admin@123456');
    logger.info('Accountant: accountant@artha.local / Accountant@123');
    logger.info('Viewer: user@example.com / testuser123');
    
    process.exit(0);
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();