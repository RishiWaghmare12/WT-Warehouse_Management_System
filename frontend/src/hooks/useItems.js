import { useState, useEffect } from 'react';
import { warehouseApi } from '../services/api';
import { useToast } from './useToast';

export const useItems = (autoFetch = true) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await warehouseApi.getAllItems();
      
      if (response.success && response.data) {
        const itemsData = response.data.data || response.data;
        if (Array.isArray(itemsData)) {
          setItems(itemsData);
        } else {
          throw new Error('Invalid data format received');
        }
      } else {
        throw new Error('Failed to fetch items');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch items';
      setError(errorMsg);
      showError(errorMsg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return { items, loading, error, refetch: fetchItems };
};
