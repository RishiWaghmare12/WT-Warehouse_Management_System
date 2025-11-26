const { pool } = require('../config/db');

class Transaction {
  // Create a new transaction
  static async create(itemId, quantity, type) {
    const result = await pool.query(`
      INSERT INTO transactions (item_id, quantity, transaction_type) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, [itemId, quantity, type]);
    return result.rows[0];
  }

  // Get all transactions
  static async getAll() {
    const result = await pool.query(`
      SELECT t.*, i.name as item_name, c.name as category_name 
      FROM transactions t
      JOIN items i ON t.item_id = i.item_id
      JOIN categories c ON i.category_id = c.category_id
      ORDER BY t.transaction_date DESC
    `);
    return result.rows;
  }
}

module.exports = Transaction;