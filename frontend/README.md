# TruEstate Frontend

## Overview
Frontend application for the TruEstate Retail Sales Management System. Built with React and Vite, featuring advanced search, filtering, sorting, and pagination.

## Tech Stack
- React 18.3.1
- Vite 6.0.3
- TailwindCSS 3.4.17
- Axios 1.7.9
- Lucide React (Icons)
- React Hot Toast (Notifications)

## Project Structure
```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API services
│   ├── styles/               # CSS and Tailwind styles
│   ├── App.jsx               # Main application component
│   └── main.jsx              # Entry point
├── public/                   # Static assets
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
└── package.json              # Dependencies
```

## Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

For production:
```env
VITE_API_URL=https://your-backend-url.com
```

## Installation
```bash
cd frontend
npm install
```

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

### Search
- Full-text search across customer name and phone number
- Case-insensitive matching
- Real-time results
- Works with filters and sorting

### Filters
1. Customer Region (Multi-select)
2. Gender (Multi-select)
3. Age Range (Min/Max)
4. Product Category (Multi-select)
5. Tags (Multi-select)
6. Payment Method (Multi-select)
7. Date Range (From/To)

### Sorting
- Date (Newest/Oldest First)
- Quantity (High/Low)
- Customer Name (A-Z/Z-A)

### Pagination
- 10 items per page
- Previous/Next navigation
- Page information display
- State preservation

### Additional Features
- Real-time statistics cards
- Phone number copy with toast notification
- Loading states
- Error handling
- Responsive design

## Components

### Layout Components
- `Sidebar.jsx` - Navigation sidebar

### Feature Components
- `SearchBar.jsx` - Search input
- `FilterBar.jsx` - Filter controls container
- `FilterDropdown.jsx` - Reusable multi-select filter
- `DateRangeFilter.jsx` - Date range picker
- `AgeRangeFilter.jsx` - Age range inputs
- `SortDropdown.jsx` - Sorting options

### Data Display Components
- `StatsCards.jsx` - Statistics display
- `TransactionTable.jsx` - Data table
- `Pagination.jsx` - Page navigation

## Custom Hooks

### useTransactions
Manages transaction data, filters, and pagination state.

**Returns:**
- `transactions` - Array of transaction objects
- `pagination` - Pagination metadata
- `stats` - Statistics object
- `loading` - Loading state
- `filters` - Current filter state
- `updateFilters()` - Update filter function
- `resetFilters()` - Reset all filters

### useFilterOptions
Fetches available filter options for dropdowns.

**Returns:**
- `filterOptions` - Object with filter options
- `loading` - Loading state

## Running the Application

### Development
```bash
npm run dev
```
Application runs on http://localhost:3000

### Production Build
```bash
npm run build
```
Build output in `dist/` directory

### Preview Production Build
```bash
npm run preview
```

## Styling
- TailwindCSS for utility-first styling
- Custom color palette matching Figma design
- Inter font from Google Fonts
- Responsive design for all screen sizes

## API Integration
All API calls are handled through `src/services/api.js` using Axios.

**Base URL:** Configured via `VITE_API_URL` environment variable

**Endpoints:**
- `GET /api/transactions` - Fetch transactions
- `GET /api/filter-options` - Fetch filter options

## State Management
- React hooks for local state
- Custom hooks for shared state
- No external state management library needed

## Performance Optimizations
- Component memoization
- Debounced search input
- Efficient re-renders
- Code splitting with Vite
- Lazy loading

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips
- Use React DevTools for debugging
- Check Network tab for API calls
- Use Vite HMR for fast development
- Follow component structure for consistency
