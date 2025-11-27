# Mission 5 Phase 1 - Trade Me Auction Tools

Backend tools for a simplified Trade Me auction system built with Node.js and MongoDB.

## Projects

### auction-seeder
CLI tool to seed and manage auction data in MongoDB.

```bash
cd auction-seeder
npm install
npm run seed
```

### auction-api
REST API to search and retrieve auction items.

```bash
cd auction-api
npm install
npm run dev
```

Server runs on http://localhost:3000

## Prerequisites

- Node.js v18+
- MongoDB running locally on port 27017

## Testing

Both projects include Jest test suites:

```bash
cd auction-seeder && npm test  # 29 tests
cd auction-api && npm test     # 27 tests
```
