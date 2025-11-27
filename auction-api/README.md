# Auction API

REST API to search and retrieve auction items from MongoDB.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB running locally on port 27017
- Seeded data from `auction-seeder` CLI tool

## Installation

```bash
cd auction-api
npm install
```

## Running the Server

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Get All Auctions
```
GET /api/auctions
GET /api/auctions?minPrice=100&maxPrice=500&limit=5
```

### Search Auctions
```
GET /api/auctions/search?q=laptop
GET /api/auctions/search?q=bike&minPrice=200&maxPrice=700
```

### Get Single Auction
```
GET /api/auctions/:id
```

### Get Similar Auctions
```
GET /api/auctions/:id/similar
GET /api/auctions/:id/similar?limit=3
```

## Response Format

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "title": "Item Title",
      "description": "Item description",
      "start_price": 100,
      "reserve_price": 200,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```
