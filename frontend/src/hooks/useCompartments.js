import { useState, useEffect } from 'react';
import { warehouseApi } from '../services/api';
import { useToast } from './useToast';

export const useCompartments = (autoFetch = true) => {
  const [compartments, setCompartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useToast();

  const fetchCompartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await warehouseApi.getCompartments();
      
      if (response.success && response.data) {
        const compartmentsData = response.data.data || response.data;
        if (Array.isArray(compartmentsData)) {
          setCompartments(compartmentsData);
        } else {
          throw new Error('Invalid data format received');
        }
      } else {
        throw new Error('Failed to fetch compartments');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch compartments';
      setError(errorMsg);
      showError(errorMsg);
      setCompartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchCompartments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return { compartments, loading, error, refetch: fetchCompartments };
};
