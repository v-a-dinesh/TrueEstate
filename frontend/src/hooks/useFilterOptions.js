import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';

export const useFilterOptions = () => {
  const [filterOptions, setFilterOptions] = useState({
    customerRegion: [],
    gender: [],
    productCategory: [],
    tags: [],
    paymentMethod: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoading(true);
      try {
        const response = await transactionAPI.getFilterOptions();
        if (response.success) {
          setFilterOptions(response.data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  return { filterOptions, loading };
};
