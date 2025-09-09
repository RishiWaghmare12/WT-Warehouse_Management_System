const express = require("express");
const cors = require("cors");
const { connectDB, pool } = require("./config/db");
const initDB = require("./db/init");

// Import API Routes
const compartmentRoutes = require("./routes/compartments");
const itemRoutes = require("./routes/items");
const transactionRoutes = require("./routes/transactions");

const app = express();

// Configure CORS to allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const startServer = async () => {
  try {
    // Connect to database and initialize
    await connectDB();
    await initDB();
    
    // Root route
    app.get('/', (req, res) => {
      res.json({
        message: 'Warehouse Management API is running',
        apiRoutes: {
          compartments: '/api/compartments',
          items: '/api/items',
          transactions: '/api/transactions'
        }
      });
    });

    // Health check route to verify database connection
    app.get('/health', async (req, res) => {
      try {
        const result = await pool.query('SELECT NOW()');
        res.json({
          status: 'healthy',
          dbConnection: 'connected',
          timestamp: result.rows[0].now
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
    app.use('/api/compartments', compartmentRoutes);
    app.use('/api/items', itemRoutes);
    app.use('/api/transactions', transactionRoutes);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Global error handler:', err.stack);
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
      });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server error:", err.message);
    process.exit(1);
  }
}

startServer();
