const express = require('express');
const mongoose = require('mongoose');

const compartmentRoutes = require('./compartments');
const itemRoutes = require('./items');
const transactionRoutes = require('./transactions');

const router = express.Router();

// Root route
router.get('/', (req, res) => {
  res.json({
    message: 'Warehouse Management API is running',
    apiRoutes: {
      compartments: '/api/compartments',
      items: '/api/items',
      transactions: '/api/transactions'
    }
  });
});

// Health check route
router.get('/health', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const isConnected = state === 1;
    
    res.json({
      status: isConnected ? 'healthy' : 'unhealthy',
      dbConnection: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      dbConnection: 'failed',
      error: error.message
    });
  }
});

// API Routes
router.use('/api/compartments', compartmentRoutes);
router.use('/api/items', itemRoutes);
router.use('/api/transactions', transactionRoutes);

module.exports = router;
