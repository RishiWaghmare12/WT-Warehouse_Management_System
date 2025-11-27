const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error("MONGODB_URI environment variable is not set");
    throw new Error("MONGODB_URI environment variable is not set");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log("MongoDB connected successfully via Mongoose");
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err.message);
      
      if (attempt === retries) {
        console.error("MongoDB connection failed after all retries");
        throw err;
      }
      
      const delay = 1000 * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = { connectDB };
