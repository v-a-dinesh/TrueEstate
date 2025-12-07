# TruEstate Backend

## Overview
Backend API server for the TruEstate Retail Sales Management System. Built with Express.js and Turso (cloud SQLite) with CSV fallback for resilience.

## Tech Stack
- Node.js 22.13.1
- Express.js 4.21.2
- Turso (@libsql/client 0.15.15)
- CSV Parser 3.0.0
- CORS 2.8.5
- Dotenv 16.4.7

## Project Structure
```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   ├── services/             # Business logic
│   ├── utils/                # Helper utilities
│   ├── routes/               # API routes
│   ├── models/               # Data models
│   ├── scripts/              # Data loading scripts
│   └── index.js              # Entry point
├── .env                      # Environment variables
└── package.json              # Dependencies
```

## Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
CSV_FILE_PATH=./truestate_assignment_dataset.csv
```

## Installation
```bash
cd backend
npm install
```

## Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run load-turso` - Load CSV data to Turso database

## API Endpoints

### GET /api/transactions
Fetch transactions with optional filters, search, sorting, and pagination.

**Query Parameters:**
- `search` - Search by customer name or phone number
- `customerRegion` - Filter by region (array)
- `gender` - Filter by gender (array)
- `ageMin` - Minimum age
- `ageMax` - Maximum age
- `productCategory` - Filter by category (array)
- `tags` - Filter by tags (array)
- `paymentMethod` - Filter by payment method (array)
- `dateFrom` - Start date
- `dateTo` - End date
- `sortBy` - Sort field (date, quantity, customerName)
- `sortOrder` - Sort direction (asc, desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 100000,
      "totalItems": 1000000,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "stats": {
      "totalQuantity": 12345,
      "totalAmount": 1234567.89,
      "totalDiscount": 12345.67,
      "transactionCount": 10
    }
  }
}
```

### GET /api/filter-options
Fetch available filter options for dropdowns.

**Response:**
```json
{
  "success": true,
  "data": {
    "customerRegion": ["North", "South", "East", "West", "Central"],
    "gender": ["Male", "Female"],
    "productCategory": ["Electronics", "Clothing", "Beauty"],
    "paymentMethod": ["Credit Card", "Debit Card", "Cash", "UPI"]
  }
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "dataSource": "Turso (with CSV fallback)"
}
```

## Database Strategy

### Primary: Turso (Cloud SQLite)
- Fast queries (< 50ms)
- 8 indexes for optimization
- Handles 1,000,000 records

### Fallback: CSV In-Memory
- Automatic activation on Turso failure
- Seamless user experience
- Query performance < 100ms

## Running the Server

### Development
```bash
npm run dev
```
Server runs on http://localhost:5000

### Production
```bash
npm start
```

## Loading Data to Turso
```bash
npm run load-turso
```
This will load all 1,000,000 records from CSV to Turso database.

## Error Handling
- All errors are caught and logged
- Automatic failover to CSV on database errors
- No errors exposed to frontend
- Graceful degradation

## Performance
- Query response: < 100ms
- Supports concurrent requests
- Optimized with database indexes
- Efficient pagination

## Security
- Environment variables for sensitive data
- Parameterized queries (SQL injection prevention)
- CORS configuration
- Input validation
