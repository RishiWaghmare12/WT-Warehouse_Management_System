const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const seedDatabase = require('./seed');

const initDB = async () => {
  try {
    // Run schema setup
    const sqlSetup = fs.readFileSync(
      path.join(__dirname, 'setup.sql'),
      'utf8'
    );

    await pool.query(sqlSetup);
    console.log('Database schema initialized');

    // Seed initial data
    await seedDatabase();

  } catch (err) {
    console.error('Database initialization error:', err.message);
    throw err;
  }
};

module.exports = initDB;