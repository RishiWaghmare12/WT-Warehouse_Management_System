const seedDatabase = require('./seed');

const initDB = async () => {
  try {

    console.log('Database schema initialized');

    // Seed initial data
    await seedDatabase();

  } catch (err) {
    console.error('Database initialization error:', err.message);
    throw err;
  }
};

module.exports = initDB;
