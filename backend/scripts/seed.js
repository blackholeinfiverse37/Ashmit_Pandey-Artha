require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

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
        email: 'admin@example.com',
        password: 'admin123'
      },
      {
        name: 'Test User',
        email: 'user@example.com',
        password: 'user123'
      }
    ];

    await User.insertMany(users);
    console.log('Sample data seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();