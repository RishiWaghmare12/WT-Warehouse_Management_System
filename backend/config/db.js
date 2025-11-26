const { MongoClient } = require("mongodb");
require("dotenv").config();

let client = null;
let db = null;

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error("MONGODB_URI environment variable is not set");
    throw new Error("MONGODB_URI environment variable is not set");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      client = new MongoClient(uri);
      await client.connect();
      db = client.db();
      console.log("MongoDB connected successfully");
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err.message);
      
      if (attempt === retries) {
        console.error("MongoDB connection failed after all retries");
        throw err;
      }
      
      // Exponential backoff before retry
      const delay = 1000 * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
};

const getClient = () => {
  if (!client) {
    throw new Error("Client not initialized. Call connectDB() first.");
  }
  return client;
};

module.exports = { connectDB, getDb, getClient };
