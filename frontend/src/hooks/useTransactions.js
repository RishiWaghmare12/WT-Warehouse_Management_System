import { useState, useEffect } from 'react';
import { warehouseApi } from '../services/api';
import { useToast } from './useToast';

export const useTransactions = (autoFetch = true) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await warehouseApi.getAllTransactions();
      
      if (response.success && response.data) {
        const transactionsData = response.data.data || response.data;
        if (Array.isArray(transactionsData)) {
          setTransactions(transactionsData);
        } else {
          throw new Error('Invalid data format received');
        }
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch transactions';
      setError(errorMsg);
      showError(errorMsg);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return { transactions, loading, error, refetch: fetchTransactions };
};
