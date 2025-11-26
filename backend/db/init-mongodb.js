/**
 * MongoDB initialization script
 * Sets up collections and indexes for the warehouse management system
 */

const { connectDB, getDb } = require('../config/db');

const initMongoDB = async () => {
  try {
    await connectDB();
    const db = getDb();

    console.log('Setting up MongoDB collections and indexes...');

    // Create categories collection with unique name index
    const categoriesCollection = db.collection('categories');
    await categoriesCollection.createIndex({ name: 1 }, { unique: true });
    console.log('Categories collection: unique index on name created');

    // Create items collection with indexes
    const itemsCollection = db.collection('items');
    await itemsCollection.createIndex({ category_id: 1 });
    await itemsCollection.createIndex({ name: 1, category_id: 1 }, { unique: true });
    console.log('Items collection: indexes on category_id and unique (name, category_id) created');

    // Create transactions collection with indexes
    const transactionsCollection = db.collection('transactions');
    await transactionsCollection.createIndex({ item_id: 1 });
    await transactionsCollection.createIndex({ transaction_date: -1 });
    await transactionsCollection.createIndex({ transaction_type: 1 });
    console.log('Transactions collection: indexes on item_id, transaction_date, and transaction_type created');

    console.log('MongoDB initialization complete!');
  } catch (err) {
    console.error('MongoDB initialization error:', err.message);
    throw err;
  }
};

module.exports = initMongoDB;

// Run if called directly
if (require.main === module) {
  initMongoDB()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
