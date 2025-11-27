const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/trademe_auctions';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
