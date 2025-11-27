const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  start_price: {
    type: Number,
    required: true,
    min: 0
  },
  reserve_price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Create text index for search functionality
auctionSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Auction', auctionSchema);
