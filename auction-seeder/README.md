# Auction Seeder CLI

A command-line tool to seed and manage auction data in MongoDB for the Trade Me project.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB installed and running locally on port 27017

## Installation

```bash
# Clone the repository, then:
cd auction-seeder
npm install
```

## Usage

### Seed the database
```bash
npm run seed
# or
node src/index.js seed
```

### Delete all data
```bash
npm run delete -- --force
# or
node src/index.js delete --force
```

### List all auctions
```bash
npm run list
# or
node src/index.js list
```

## Data Structure

Each auction item contains:
- `title` - Name of the item
- `description` - Detailed description
- `start_price` - Starting bid price
- `reserve_price` - Minimum price for sale

## Sample Data

The tool includes 8 sample auction items in `data/auctions.json`. You can modify this file to add your own test data.
