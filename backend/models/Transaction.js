const { pool } = require('../config/db');

class Transaction {
  static async create(itemId, quantity, type) {
    try {
      console.log(`Creating new transaction: ${type} ${quantity} units for item ID ${itemId}`);
      const result = await pool.query(`
        INSERT INTO transactions (item_id, quantity, transaction_type) 
        VALUES ($1, $2, $3) 
        RETURNING *
      `, [itemId, quantity, type]);
      
      console.log(`Successfully created transaction ID: ${result.rows[0].transaction_id}`);
      return result.rows[0];
    } catch (err) {
      console.error(`Error in Transaction.create(${itemId}, ${quantity}, ${type}):`, err);
      throw new Error(`Error creating transaction: ${err.message}`);
    }
  }

  // Get all transactions
  static async getAll() {
    try {
      console.log('Fetching all transactions');
      const result = await pool.query(`
        SELECT t.*, i.name as item_name, c.name as category_name 
        FROM transactions t
        JOIN items i ON t.item_id = i.item_id
        JOIN categories c ON i.category_id = c.category_id
        ORDER BY t.transaction_date DESC
      `);
      console.log(`Retrieved ${result.rowCount} transactions`);
      return result.rows;
    } catch (err) {
      console.error('Error in Transaction.getAll():', err);
      throw new Error(`Error fetching transactions: ${err.message}`);
    }
  }

  // Get transactions by item ID
  static async getByItemId(itemId) {
    try {
      console.log(`Fetching transactions for item ID: ${itemId}`);
      const result = await pool.query(`
        SELECT t.*, i.name as item_name, c.name as category_name 
        FROM transactions t
        JOIN items i ON t.item_id = i.item_id
        JOIN categories c ON i.category_id = c.category_id
        WHERE t.item_id = $1
        ORDER BY t.transaction_date DESC
      `, [itemId]);
      console.log(`Retrieved ${result.rowCount} transactions for item ID ${itemId}`);
      return result.rows;
    } catch (err) {
      console.error(`Error in Transaction.getByItemId(${itemId}):`, err);
      throw new Error(`Error fetching transactions by item: ${err.message}`);
    }
  }

  // Get transactions by category ID
  static async getByCategoryId(categoryId) {
    try {
      console.log(`Fetching transactions for category ID: ${categoryId}`);
      const result = await pool.query(`
        SELECT t.*, i.name as item_name, c.name as category_name
        FROM transactions t
        JOIN items i ON t.item_id = i.item_id
        JOIN categories c ON i.category_id = c.category_id
        WHERE c.category_id = $1
        ORDER BY t.transaction_date DESC
      `, [categoryId]);
      console.log(`Retrieved ${result.rowCount} transactions for category ID ${categoryId}`);
      return result.rows;
    } catch (err) {
      console.error(`Error in Transaction.getByCategoryId(${categoryId}):`, err);
      throw new Error(`Error fetching transactions for category: ${err.message}`);
    }
  }

  // Get transactions by type (SEND or RECEIVE)
  static async getByType(type) {
    try {
      console.log(`Fetching transactions by type: ${type}`);
      const result = await pool.query(`
        SELECT t.*, i.name as item_name, c.name as category_name 
        FROM transactions t
        JOIN items i ON t.item_id = i.item_id
        JOIN categories c ON i.category_id = c.category_id
        WHERE t.transaction_type = $1
        ORDER BY t.transaction_date DESC
      `, [type]);
      console.log(`Retrieved ${result.rowCount} ${type} transactions`);
      return result.rows;
    } catch (err) {
      console.error(`Error in Transaction.getByType(${type}):`, err);
      throw new Error(`Error fetching transactions by type: ${err.message}`);
    }
  }
}

module.exports = Transaction;