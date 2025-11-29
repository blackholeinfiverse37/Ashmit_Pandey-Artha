import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import chartOfAccountsService from '../src/services/chartOfAccounts.service.js';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});

    // Create sample users
    const users = [
      {
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@artha.local',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin'
      },
      {
        name: 'Test User',
        email: 'user@example.com',
        password: 'testuser123',
        role: 'viewer'
      },
      {
        name: 'Accountant User',
        email: 'accountant@artha.local',
        password: 'Accountant@123',
        role: 'accountant'
      }
    ];

    await User.insertMany(users);
    console.log('Users seeded successfully');

    // Seed Chart of Accounts using service
    const accountsResult = await chartOfAccountsService.seedDefaultAccounts();
    console.log(accountsResult.message);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();