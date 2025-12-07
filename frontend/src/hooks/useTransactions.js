import { useState, useEffect, useCallback } from 'react';
import { transactionAPI } from '../services/api';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
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
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== '' && value !== null && value !== undefined) {
          if (Array.isArray(value) && value.length > 0) {
            params[key] = value;
          } else if (!Array.isArray(value)) {
            params[key] = value;
          }
        }
      });
      
      const result = await transactionAPI.getTransactions(params);
      
      setTransactions(result.data.transactions);
      setPagination(result.data.pagination);
      setStats(result.data.stats);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
      });
      setStats({
        totalQuantity: 0,
        totalAmount: 0,
        totalDiscount: 0,
        transactionCount: 0
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  };

  const resetFilters = () => {
    setFilters({
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
    });
  };

  return {
    transactions,
    pagination,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchTransactions
  };
};
