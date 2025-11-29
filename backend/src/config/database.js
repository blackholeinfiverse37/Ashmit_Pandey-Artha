import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);
    
    logger.info(`MongoDB Connected: ${mongoose.connection.host}`);
    
    // Enable transactions for MongoDB replica set
    if (process.env.NODE_ENV === 'production') {
      mongoose.connection.db.admin().command({ replSetGetStatus: 1 })
        .then(() => logger.info('Replica set detected - transactions enabled'))
        .catch(() => logger.warn('Not running as replica set - transactions may fail'));
    }
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;