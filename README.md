# TruEstate - Retail Sales Management System

## Live Application
- **Frontend:** https://true-estate-tau.vercel.app/
- **Backend API:** https://truestate-backend-3mg8.onrender.com
- **GitHub Repository:** https://github.com/v-a-dinesh/TrueEstate

## Overview
A full-stack retail sales management system featuring advanced search, multi-select filtering, sorting, and pagination capabilities. The application efficiently handles 1,000,000 transaction records with optimized query performance using Turso (cloud SQLite) database. The system provides real-time statistics and a responsive UI matching the provided Figma design specifications.

## Tech Stack

**Frontend:**
- React 18.3.1
- Vite 6.0.3
- TailwindCSS 3.4.17
- Axios 1.7.9
- Lucide React (Icons)
- React Hot Toast (Notifications)

**Backend:**
- Node.js 22.13.1
- Express.js 4.21.2
- Turso (@libsql/client 0.15.15)
- CSV Parser 3.0.0
- CORS 2.8.5
- Dotenv 16.4.7

**Database:**
- Turso (Cloud SQLite) - 1,000,000 records

## Search Implementation Summary

**Implementation:**
- Full-text search across Customer Name and Phone Number fields
- Case-insensitive matching using SQL LIKE with COLLATE NOCASE for Turso
- Backend query: `WHERE (customerName LIKE ? OR phoneNumber LIKE ?)`
- Frontend debouncing for optimal performance
- Works seamlessly with active filters and sorting

**Performance:**
- Query response time: < 100ms
- Indexed fields for faster lookups
- Supports partial matching

## Filter Implementation Summary

**Implemented Filters:**
1. **Customer Region** - Multi-select dropdown
2. **Gender** - Multi-select dropdown
3. **Age Range** - Min/Max numeric inputs
4. **Product Category** - Multi-select dropdown
5. **Tags** - Multi-select dropdown with LIKE matching
6. **Payment Method** - Multi-select dropdown
7. **Date Range** - From/To date pickers

**Implementation:**
- All filters use SQL IN clauses for multi-select
- Range filters use BETWEEN or >= / <= operators
- Filters combined with AND logic for precise results
- Dynamic WHERE clause construction based on active filters
- State management preserves all filter combinations

## Sorting Implementation Summary

**Sorting Options:**
1. **Date** - Ascending/Descending (Default: Newest First)
2. **Quantity** - Ascending/Descending
3. **Customer Name** - Ascending/Descending (A-Z / Z-A)

**Implementation:**
- Backend ORDER BY clause with dynamic column and direction
- Frontend dropdown with 6 sort combinations
- Sorting preserves active search and filter states
- Default sort: Date descending (newest first)

## Pagination Implementation Summary

**Configuration:**
- Page size: 10 items per page
- Total pages: Calculated dynamically based on filtered results
- Navigation: Previous, Current Page, Next buttons

**Implementation:**
- Backend LIMIT/OFFSET for efficient data retrieval
- Total count query for accurate page calculation
- State preservation: Search, filters, and sorting maintained across pages
- Pagination metadata: currentPage, totalPages, totalItems, hasNextPage, hasPrevPage
- Page resets to 1 when filters or search changes

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd TruEstate
```

2. **Install dependencies**
```bash
# Install root dependencies (optional)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure environment variables**

Create `.env` file in `backend/` directory:
```env
PORT=5000
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
CSV_FILE_PATH=./truestate_assignment_dataset.csv
```

Create `.env` file in `frontend/` directory:
```env
# For local development
VITE_API_URL=http://localhost:5000

# For production (already configured)
# VITE_API_URL=https://truestate-backend-3mg8.onrender.com
```

4. **Load data to Turso (first time setup)**
```bash
cd backend
npm run load-turso
```
Note: This step is only needed for local development. Production uses pre-loaded Turso database.

5. **Start the application**

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

6. **Access the application**
```
Open browser: http://localhost:3000
```

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run load-turso` - Load CSV data to Turso database

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure
```
TruEstate/
├── backend/          # Backend API server
├── frontend/         # React frontend application
├── docs/            # Documentation
└── README.md        # This file
```

## Deployment

### Production URLs
- **Frontend (Vercel):** https://true-estate-tau.vercel.app/
- **Backend (Render):** https://truestate-backend-3mg8.onrender.com
- **Database (Turso):** Cloud-hosted SQLite with 1,000,000 records

### Architecture
- Frontend deployed on Vercel (automatic deployments from main branch)
- Backend deployed on Render (automatic deployments from main branch)
- Database hosted on Turso (read-only, pre-loaded with data)

For detailed architecture information, see [docs/architecture.md](docs/architecture.md)
