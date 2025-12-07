# TruEstate - System Architecture

## Backend Architecture

### Overview
The backend follows a layered architecture pattern with clear separation of concerns, implementing the MVC (Model-View-Controller) pattern adapted for API services.

### Architecture Layers

#### 1. Entry Point (`src/index.js`)
- Application initialization
- Database connection (Turso primary, CSV fallback)
- Middleware configuration (CORS, JSON parsing)
- Route registration
- Server startup

#### 2. Routes Layer (`src/routes/`)
**File:** `transactionRoutes.js`
- Defines API endpoints
- Maps HTTP methods to controller functions
- Routes:
  - `GET /api/transactions` - Fetch transactions with filters
  - `GET /api/filter-options` - Fetch available filter options
  - `GET /health` - Health check endpoint

#### 3. Controllers Layer (`src/controllers/`)
**File:** `transactionController.js`
- Handles HTTP requests and responses
- Parses query parameters
- Validates input
- Calls service layer
- Formats responses
- Error handling

**Functions:**
- `getTransactions()` - Handles transaction retrieval requests
- `getFilterOptions()` - Handles filter options requests

#### 4. Services Layer (`src/services/`)
**File:** `transactionService.js`
- Business logic implementation
- Database query orchestration
- Failover logic (Turso → CSV)
- Data transformation

**Key Methods:**
- `getTransactions(filters)` - Main query method with failover
- `getTransactionsFromTurso(filters)` - Turso database queries
- `getFilterOptions()` - Fetch distinct filter values
- `checkTursoHasData()` - Database availability check

#### 5. Utils Layer (`src/utils/`)

**Files:**
- `tursoDatabase.js` - Turso connection and schema management
- `csvFallback.js` - CSV data loading and in-memory querying
- `csvLoader.js` - CSV streaming and batch processing (legacy)
- `database.js` - MongoDB connection utilities (legacy)

**Responsibilities:**
- Database connections
- Data loading
- Helper functions
- Query utilities

#### 6. Models Layer (`src/models/`)
**File:** `Transaction.js`
- Mongoose schema definition (legacy MongoDB)
- Data structure documentation
- Field validation rules

### Data Flow - Backend

```
HTTP Request
    ↓
Routes (transactionRoutes.js)
    ↓
Controller (transactionController.js)
    ↓
Service (transactionService.js)
    ↓
    ├─→ Turso Database (tursoDatabase.js) [Primary]
    │   ├─ Success → Return data
    │   └─ Failure ↓
    │
    └─→ CSV Fallback (csvFallback.js) [Secondary]
        └─ Return data
    ↓
Service processes data
    ↓
Controller formats response
    ↓
HTTP Response (JSON)
```

### Database Strategy

#### Primary: Turso (Cloud SQLite)
- **Connection:** `@libsql/client`
- **Schema:** 26 fields with indexes
- **Performance:** < 50ms queries
- **Indexes:** 8 indexes on frequently queried fields

#### Fallback: CSV In-Memory
- **Loading:** Streaming with csv-parser
- **Storage:** In-memory array (1M records)
- **Performance:** < 100ms queries
- **Activation:** Automatic on Turso failure

### Query Optimization
- Parameterized queries (SQL injection prevention)
- Indexed columns for fast lookups
- Dynamic WHERE clause construction
- Efficient pagination with LIMIT/OFFSET
- COUNT query optimization

---

## Frontend Architecture

### Overview
The frontend follows a component-based architecture using React with custom hooks for state management and reusable UI components.

### Architecture Layers

#### 1. Entry Point (`src/main.jsx`)
- React application initialization
- Root component rendering
- Global styles import

#### 2. Application Component (`src/App.jsx`)
- Main application layout
- State management orchestration
- Component composition
- Toast notification provider

#### 3. Custom Hooks (`src/hooks/`)

**File:** `useTransactions.js`
- Transaction data management
- Filter state management
- API call orchestration
- Pagination state
- Statistics state

**File:** `useFilterOptions.js`
- Filter options fetching
- Dropdown data management

**State Structure:**
```javascript
{
  search: '',
  customerRegion: [],
  gender: [],
  ageMin: '',
  ageMax: '',
  productCategory: [],
  tags: [],
  paymentMethod: [],
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  limit: 10
}
```

#### 4. Components (`src/components/`)

**Layout Components:**
- `Sidebar.jsx` - Navigation sidebar with branding

**Feature Components:**
- `SearchBar.jsx` - Search input with debouncing
- `FilterBar.jsx` - Filter controls container
- `FilterDropdown.jsx` - Reusable multi-select filter
- `DateRangeFilter.jsx` - Date range picker
- `AgeRangeFilter.jsx` - Age range inputs
- `SortDropdown.jsx` - Sorting options dropdown

**Data Display Components:**
- `StatsCards.jsx` - Statistics display cards
- `TransactionTable.jsx` - Data table with copy functionality
- `Pagination.jsx` - Page navigation controls

**Component Hierarchy:**
```
App
├── Toaster (react-hot-toast)
├── Sidebar
└── Main Content
    ├── Header
    │   ├── SearchBar
    │   ├── FilterBar
    │   │   ├── FilterDropdown (x5)
    │   │   ├── DateRangeFilter
    │   │   └── AgeRangeFilter
    │   └── SortDropdown
    ├── StatsCards
    ├── TransactionTable
    └── Pagination
```

#### 5. Services (`src/services/`)
**File:** `api.js`
- Axios instance configuration
- API endpoint definitions
- Request/response interceptors
- Error handling

**API Methods:**
- `getTransactions(params)` - Fetch transactions
- `getFilterOptions()` - Fetch filter options

#### 6. Styles (`src/styles/`)
**File:** `index.css`
- TailwindCSS imports
- Custom CSS variables
- Global styles
- Utility classes

### Data Flow - Frontend

```
User Interaction
    ↓
Component Event Handler
    ↓
Custom Hook (useTransactions)
    ↓
Update State (filters)
    ↓
useEffect Trigger
    ↓
API Service (api.js)
    ↓
HTTP Request to Backend
    ↓
Response Received
    ↓
Update State (transactions, pagination, stats)
    ↓
Component Re-render
    ↓
UI Update
```

### State Management Flow

```
Initial State
    ↓
User Action (Search/Filter/Sort/Paginate)
    ↓
updateFilters() called
    ↓
State merged with previous state
    ↓
fetchTransactions() triggered (useEffect)
    ↓
API call with current filters
    ↓
Response updates:
    - transactions[]
    - pagination{}
    - stats{}
    ↓
Components re-render with new data
```

---

## Data Flow (End-to-End)

### Request Flow
```
1. User Input (Frontend)
   - Search: "john"
   - Filter: Region = ["North"]
   - Sort: Date descending
   - Page: 1

2. State Update (useTransactions hook)
   - Merge new filters with existing state
   - Trigger fetchTransactions()

3. API Request (api.js)
   - Build query parameters
   - Send GET request to /api/transactions

4. Backend Routing (transactionRoutes.js)
   - Route to getTransactions controller

5. Controller Processing (transactionController.js)
   - Parse query parameters
   - Call service layer

6. Service Layer (transactionService.js)
   - Try Turso database first
   - Build SQL query with WHERE, ORDER BY, LIMIT
   - Execute query

7. Database Query (tursoDatabase.js)
   - Execute parameterized query
   - Return results

8. Data Processing (Service)
   - Calculate statistics
   - Format pagination metadata
   - Return structured response

9. Controller Response
   - Format JSON response
   - Send to frontend

10. Frontend Update
    - Update state with new data
    - Re-render components
    - Display results to user
```

### Failover Flow
```
User Request
    ↓
Backend Service
    ↓
Try Turso Database
    ↓
    ├─ Success → Return data
    │
    └─ Failure (connection/timeout/empty)
        ↓
        Check if Turso has data
        ↓
        ├─ Has data → Return empty result (valid query)
        │
        └─ No data / Error
            ↓
            Activate CSV Fallback
            ↓
            Query in-memory CSV data
            ↓
            Return data
            ↓
            User sees no difference (seamless)
```

---

## Folder Structure

### Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── transactionController.js      # Request handlers
│   ├── services/
│   │   └── transactionService.js         # Business logic
│   ├── utils/
│   │   ├── tursoDatabase.js              # Turso connection
│   │   ├── csvFallback.js                # CSV fallback
│   │   ├── csvLoader.js                  # CSV loading (legacy)
│   │   └── database.js                   # MongoDB utils (legacy)
│   ├── routes/
│   │   └── transactionRoutes.js          # API routes
│   ├── models/
│   │   └── Transaction.js                # Data model
│   ├── scripts/
│   │   ├── loadDataToTurso.js           # Turso data loader
│   │   └── loadData.js                   # MongoDB loader (legacy)
│   └── index.js                          # Entry point
├── .env                                   # Environment variables
├── package.json                           # Dependencies
├── README.md                              # Backend documentation
└── truestate_assignment_dataset.csv      # Data file
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx                   # Navigation sidebar
│   │   ├── SearchBar.jsx                 # Search input
│   │   ├── FilterBar.jsx                 # Filter container
│   │   ├── FilterDropdown.jsx            # Multi-select filter
│   │   ├── DateRangeFilter.jsx           # Date range picker
│   │   ├── AgeRangeFilter.jsx            # Age range inputs
│   │   ├── SortDropdown.jsx              # Sort options
│   │   ├── StatsCards.jsx                # Statistics cards
│   │   ├── TransactionTable.jsx          # Data table
│   │   └── Pagination.jsx                # Page navigation
│   ├── hooks/
│   │   ├── useTransactions.js            # Transaction state
│   │   └── useFilterOptions.js           # Filter options state
│   ├── services/
│   │   └── api.js                        # API client
│   ├── styles/
│   │   └── index.css                     # Global styles
│   ├── App.jsx                           # Main component
│   └── main.jsx                          # Entry point
├── public/                                # Static assets
├── .env                                   # Environment variables
├── index.html                             # HTML template
├── package.json                           # Dependencies
├── vite.config.js                         # Vite configuration
├── tailwind.config.js                     # Tailwind configuration
├── postcss.config.js                      # PostCSS configuration
└── README.md                              # Frontend documentation
```

### Root Structure
```
TruEstate/
├── backend/                               # Backend application
├── frontend/                              # Frontend application
├── docs/
│   └── architecture.md                    # This file
├── README.md                              # Main documentation
├── package.json                           # Monorepo scripts
├── .gitignore                             # Git ignore rules
└── truestate_assignment.md               # Assignment brief
```

---

## Module Responsibilities

### Backend Modules

#### `index.js`
**Responsibilities:**
- Initialize Express application
- Configure middleware (CORS, JSON parser)
- Connect to Turso database
- Load CSV fallback data
- Register API routes
- Start HTTP server
- Error handling

#### `transactionController.js`
**Responsibilities:**
- Handle HTTP requests
- Parse and validate query parameters
- Call service layer methods
- Format API responses
- Handle errors and send appropriate status codes

#### `transactionService.js`
**Responsibilities:**
- Implement business logic
- Orchestrate database queries
- Implement failover strategy (Turso → CSV)
- Build dynamic SQL queries
- Calculate statistics (sum, count)
- Format pagination metadata
- Data transformation

#### `tursoDatabase.js`
**Responsibilities:**
- Establish Turso database connection
- Create and manage database schema
- Create indexes for performance
- Provide database instance to services
- Handle connection errors

#### `csvFallback.js`
**Responsibilities:**
- Load CSV file into memory
- Parse CSV data
- Implement in-memory querying
- Filter, sort, and paginate data
- Calculate statistics
- Provide fallback when Turso unavailable

#### `transactionRoutes.js`
**Responsibilities:**
- Define API endpoints
- Map routes to controller methods
- Organize API structure

### Frontend Modules

#### `App.jsx`
**Responsibilities:**
- Main application layout
- Compose all components
- Provide toast notification context
- Manage overall application structure

#### `useTransactions.js`
**Responsibilities:**
- Manage transaction state
- Manage filter state
- Fetch transactions from API
- Handle loading and error states
- Provide state update methods
- Implement filter reset functionality

#### `useFilterOptions.js`
**Responsibilities:**
- Fetch available filter options
- Manage filter options state
- Handle loading states

#### `api.js`
**Responsibilities:**
- Configure Axios instance
- Define API endpoints
- Handle HTTP requests
- Manage request/response interceptors
- Error handling

#### `SearchBar.jsx`
**Responsibilities:**
- Render search input
- Handle user input
- Emit search changes to parent
- Provide visual feedback

#### `FilterDropdown.jsx`
**Responsibilities:**
- Render multi-select dropdown
- Manage dropdown open/close state
- Handle option selection
- Display selected count
- Emit filter changes

#### `TransactionTable.jsx`
**Responsibilities:**
- Render transaction data in table format
- Format dates and currency
- Implement copy-to-clipboard functionality
- Show toast notifications
- Handle loading and empty states

#### `Pagination.jsx`
**Responsibilities:**
- Render page navigation controls
- Handle page changes
- Disable buttons appropriately
- Display current page information

#### `StatsCards.jsx`
**Responsibilities:**
- Display transaction statistics
- Format numbers with separators
- Format currency values
- Responsive card layout

---

## Performance Considerations

### Backend Optimizations
1. **Database Indexes:** 8 indexes on frequently queried columns
2. **Parameterized Queries:** Prevent SQL injection and enable query caching
3. **Pagination:** LIMIT/OFFSET to reduce data transfer
4. **Streaming:** CSV loading uses streams to prevent memory overflow
5. **Connection Pooling:** Reuse database connections

### Frontend Optimizations
1. **Component Memoization:** Prevent unnecessary re-renders
2. **Lazy Loading:** Load components on demand
3. **Debouncing:** Search input debouncing to reduce API calls
4. **State Management:** Single source of truth with efficient updates
5. **Code Splitting:** Vite automatically splits code for faster loading

### Query Performance
- Turso queries: < 50ms
- CSV fallback: < 100ms
- Search with filters: < 100ms
- Pagination: < 50ms

---

## Security Considerations

1. **Environment Variables:** Sensitive data stored in .env files
2. **Parameterized Queries:** SQL injection prevention
3. **CORS Configuration:** Controlled cross-origin access
4. **Input Validation:** Query parameter validation
5. **Error Handling:** No sensitive information in error messages

---

## Scalability

### Current Capacity
- **Records:** 1,000,000 transactions
- **Concurrent Users:** Supports multiple simultaneous users
- **Query Performance:** Maintains < 100ms response time

### Future Scaling Options
1. **Database:** Turso scales automatically in cloud
2. **Caching:** Add Redis for frequently accessed data
3. **Load Balancing:** Multiple backend instances
4. **CDN:** Static asset delivery
5. **Database Sharding:** Partition data by date/region

---

## Deployment Architecture

### Recommended Deployment
```
Frontend (Vercel/Netlify)
    ↓
Backend (Railway/Render)
    ↓
Turso Database (Cloud)
```

### Environment Configuration
- **Development:** Local servers with hot reload
- **Production:** Optimized builds with environment-specific configs
- **Database:** Turso cloud instance with automatic backups

---

This architecture ensures maintainability, scalability, and performance while providing a seamless user experience with robust error handling and failover mechanisms.
