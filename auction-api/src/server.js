const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const auctionRoutes = require('./routes/auctions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auctions', auctionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Auction API',
    version: '1.0.0',
    endpoints: {
      'GET /api/auctions': 'Get all auctions (query: minPrice, maxPrice, limit)',
      'GET /api/auctions/search': 'Search auctions (query: q, minPrice, maxPrice, limit)',
      'GET /api/auctions/:id': 'Get auction by ID',
      'GET /api/auctions/:id/similar': 'Get similar auctions (query: limit)'
    }
  });
});

// Start server (only if not in test mode)
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if this file is run directly (not imported for testing)
if (require.main === module) {
  start();
}

// Export for testing
module.exports = { app, start };
