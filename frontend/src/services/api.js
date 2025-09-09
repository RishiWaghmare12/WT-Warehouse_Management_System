import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API response handler
const handleResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return {
      success: true,
      data: response.data,
    };
  }
  return {
    success: false,
    error: response.data.message || 'An error occurred',
  };
};

// Error handler
const handleError = (error) => {
  console.error('API Error:', error);
  return {
    success: false,
    error: error.response?.data?.message || error.message || 'An error occurred',
  };
};

// Warehouse API
export const warehouseApi = {
  // Compartments
  getCompartments: async () => {
    try {
      const response = await apiClient.get('/compartments');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Items
  getAllItems: async () => {
    try {
      const response = await apiClient.get('/items');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getItemById: async (itemId) => {
    try {
      const response = await apiClient.get(`/items/${itemId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getItemsByCategory: async (categoryId) => {
    try {
      const response = await apiClient.get(`/items/category/${categoryId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Transactions
  getAllTransactions: async () => {
    try {
      const response = await apiClient.get('/transactions');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getTransactionsByItem: async (itemId) => {
    try {
      const response = await apiClient.get(`/transactions/item/${itemId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getTransactionsByType: async (type) => {
    try {
      const response = await apiClient.get(`/transactions/type/${type}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Send items
  sendItems: async (data) => {
    try {
      const response = await apiClient.post('/transactions/send', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Receive items - existing item
  receiveExistingItem: async (data) => {
    try {
      const response = await apiClient.post('/transactions/receive', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Receive items - new item
  receiveItems: async (data) => {
    try {
      const response = await apiClient.post('/transactions/receive', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Warehouse report - combined information
  getWarehouseReport: async () => {
    try {
      const response = await apiClient.get('/compartments');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getAvailableSpace: async () => {
    try {
      const response = await apiClient.get('/compartments/available');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  }
};

export default warehouseApi;
