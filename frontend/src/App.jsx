import React from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import SortDropdown from './components/SortDropdown';
import StatsCards from './components/StatsCards';
import TransactionTable from './components/TransactionTable';
import Pagination from './components/Pagination';
import { useTransactions } from './hooks/useTransactions';
import { useFilterOptions } from './hooks/useFilterOptions';

function App() {
  const {
    transactions,
    pagination,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters
  } = useTransactions();

  const { filterOptions } = useFilterOptions();

  const handleSearchChange = (search) => {
    updateFilters({ search, page: 1 });
  };

  const handleFilterChange = (newFilters) => {
    updateFilters({ ...newFilters, page: 1 });
  };

  const handleSortChange = (sortBy, sortOrder) => {
    updateFilters({ sortBy, sortOrder, page: 1 });
  };

  const handlePageChange = (page) => {
    updateFilters({ page });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
      <Sidebar />
      
      <div className="flex-1 ml-[240px]">
        <div className="p-6">
          <header className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Sales Management System</h1>
              <SearchBar value={filters.search} onChange={handleSearchChange} />
            </div>

            <div className="flex items-center justify-between gap-4 mb-6">
              <FilterBar
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
              />
              <SortDropdown
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={handleSortChange}
              />
            </div>

            <StatsCards stats={stats} />
          </header>

          <main>
            <TransactionTable transactions={transactions} loading={loading} />
            
            {pagination.totalPages > 0 && (
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
