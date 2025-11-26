const express = require("express");
const { connectDB } = require("./config/db");
const initDB = require("./db/init");
const corsMiddleware = require("./middleware/cors");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use(routes);

// Error handling
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await initDB();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup error:", err.message);
    process.exit(1);
  }
};

startServer();
