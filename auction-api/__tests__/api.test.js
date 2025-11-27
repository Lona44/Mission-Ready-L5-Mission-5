/**
 * TDD Tests for Auction API Endpoints
 *
 * These tests verify the REST API endpoints work correctly.
 * Following TDD principles, these tests define the expected behavior
 * that each endpoint should implement.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../src/server');
const Auction = require('../src/models/Auction');

let mongoServer;

// Setup in-memory MongoDB before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clean up after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database and seed test data before each test
beforeEach(async () => {
  await Auction.deleteMany({});
});

// Helper function to seed test data
async function seedTestData() {
  const testAuctions = [
    {
      title: 'Gaming Laptop',
      description: 'High-performance gaming laptop with RTX graphics',
      start_price: 1000,
      reserve_price: 1500
    },
    {
      title: 'Mountain Bike',
      description: 'Professional mountain bike for trail riding',
      start_price: 500,
      reserve_price: 800
    },
    {
      title: 'Vintage Guitar',
      description: 'Classic acoustic guitar from the 1970s',
      start_price: 300,
      reserve_price: 600
    },
    {
      title: 'Gaming Console',
      description: 'Latest generation gaming console with controller',
      start_price: 400,
      reserve_price: 550
    },
    {
      title: 'Office Desk',
      description: 'Modern standing desk for home office',
      start_price: 200,
      reserve_price: 350
    }
  ];
  return await Auction.insertMany(testAuctions);
}


describe('API Root Endpoints', () => {

  test('GET / should return API info', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Auction API');
    expect(response.body.version).toBe('1.0.0');
    expect(response.body.endpoints).toBeDefined();
  });

  test('GET /health should return health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

});


describe('GET /api/auctions', () => {

  test('should return empty array when no auctions exist', async () => {
    const response = await request(app).get('/api/auctions');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(0);
    expect(response.body.data).toEqual([]);
  });

  test('should return all auctions', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(5);
    expect(response.body.data).toHaveLength(5);
  });

  test('should limit results with limit parameter', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions?limit=2');

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(response.body.data).toHaveLength(2);
  });

  test('should filter by minimum price', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions?minPrice=500');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    response.body.data.forEach(auction => {
      expect(auction.start_price).toBeGreaterThanOrEqual(500);
    });
  });

  test('should filter by maximum price', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions?maxPrice=400');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    response.body.data.forEach(auction => {
      expect(auction.start_price).toBeLessThanOrEqual(400);
    });
  });

  test('should filter by price range', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions?minPrice=300&maxPrice=500');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    response.body.data.forEach(auction => {
      expect(auction.start_price).toBeGreaterThanOrEqual(300);
      expect(auction.start_price).toBeLessThanOrEqual(500);
    });
  });

  test('should return auctions sorted by createdAt descending', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions');

    expect(response.status).toBe(200);
    const dates = response.body.data.map(a => new Date(a.createdAt));
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
    }
  });

});


describe('GET /api/auctions/search', () => {

  test('should return 400 when search query is missing', async () => {
    const response = await request(app).get('/api/auctions/search');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('required');
  });

  test('should search by title keyword', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions/search?q=gaming');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.query).toBe('gaming');
    expect(response.body.count).toBe(2); // Gaming Laptop and Gaming Console
  });

  test('should search by description keyword', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions/search?q=trail');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(1); // Mountain Bike
    expect(response.body.data[0].title).toBe('Mountain Bike');
  });

  test('should be case-insensitive', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions/search?q=GAMING');

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
  });

  test('should return empty array when no matches', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions/search?q=nonexistent');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(0);
    expect(response.body.data).toEqual([]);
  });

  test('should combine search with price filter', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions/search?q=gaming&minPrice=500');

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1); // Only Gaming Laptop (1000)
    expect(response.body.data[0].title).toBe('Gaming Laptop');
  });

  test('should respect limit parameter', async () => {
    await seedTestData();

    const response = await request(app).get('/api/auctions/search?q=a&limit=2');

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
  });

});


describe('GET /api/auctions/:id', () => {

  test('should return auction by ID', async () => {
    const auctions = await seedTestData();
    const targetAuction = auctions[0];

    const response = await request(app).get(`/api/auctions/${targetAuction._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(targetAuction._id.toString());
    expect(response.body.data.title).toBe(targetAuction.title);
  });

  test('should return 404 for non-existent auction', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/api/auctions/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('not found');
  });

  test('should return 500 for invalid ID format', async () => {
    const response = await request(app).get('/api/auctions/invalid-id');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

});


describe('GET /api/auctions/:id/similar', () => {

  test('should return similar auctions based on keywords', async () => {
    const auctions = await seedTestData();
    const gamingLaptop = auctions.find(a => a.title === 'Gaming Laptop');

    const response = await request(app).get(`/api/auctions/${gamingLaptop._id}/similar`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.originalItem).toBe('Gaming Laptop');
    // Should find Gaming Console as similar (shares "Gaming")
    const titles = response.body.data.map(a => a.title);
    expect(titles).toContain('Gaming Console');
  });

  test('should not include the original auction in results', async () => {
    const auctions = await seedTestData();
    const gamingLaptop = auctions.find(a => a.title === 'Gaming Laptop');

    const response = await request(app).get(`/api/auctions/${gamingLaptop._id}/similar`);

    expect(response.status).toBe(200);
    const ids = response.body.data.map(a => a._id);
    expect(ids).not.toContain(gamingLaptop._id.toString());
  });

  test('should respect limit parameter', async () => {
    const auctions = await seedTestData();
    const auction = auctions[0];

    const response = await request(app).get(`/api/auctions/${auction._id}/similar?limit=1`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeLessThanOrEqual(1);
  });

  test('should return 404 for non-existent auction', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/api/auctions/${fakeId}/similar`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('should return empty array when no similar items found', async () => {
    // Create a unique auction with no similar items
    const uniqueAuction = await Auction.create({
      title: 'Xyz Unique Item',
      description: 'Completely unique description',
      start_price: 100,
      reserve_price: 200
    });

    const response = await request(app).get(`/api/auctions/${uniqueAuction._id}/similar`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(0);
  });

});


describe('API Response Format', () => {

  test('all successful responses should have success: true', async () => {
    await seedTestData();

    const endpoints = [
      '/api/auctions',
      '/api/auctions/search?q=test'
    ];

    for (const endpoint of endpoints) {
      const response = await request(app).get(endpoint);
      expect(response.body.success).toBe(true);
    }
  });

  test('all list responses should have count and data fields', async () => {
    await seedTestData();

    const endpoints = [
      '/api/auctions',
      '/api/auctions/search?q=test'
    ];

    for (const endpoint of endpoints) {
      const response = await request(app).get(endpoint);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.count).toBe('number');
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });

  test('error responses should have success: false and error message', async () => {
    const response = await request(app).get('/api/auctions/search');

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
    expect(typeof response.body.error).toBe('string');
  });

});
