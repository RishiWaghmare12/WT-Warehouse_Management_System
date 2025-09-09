const { Pool } = require("pg");
require("dotenv").config();

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URI,
      max: 1,
      connectionTimeoutMillis: 5000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL error:', err);
      pool = null;
    });
  }
  
  return pool;
}

const connectDB = async () => {
  try {
    const client = await getPool().connect();
    console.log("PostgreSQL connected successfully");
    client.release();
    return;
  } catch (err) {
    console.error("PostgreSQL connection error:", err.message);
  }
};

const runQuery = async (queryText, params, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const client = await getPool().connect();
      try {
        const result = await client.query(queryText, params);
        return result;
      } finally {
        client.release();
      }
    } catch (err) {
      if (attempt === retries) throw err;
      console.error(`Query attempt ${attempt + 1} failed: ${err.message}. Retrying...`);
      await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt)));
    }
  }
};

module.exports = { connectDB, pool: getPool(), runQuery };
