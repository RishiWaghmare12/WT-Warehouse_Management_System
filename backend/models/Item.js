const { pool } = require('../config/db');

class Item {
  // Get all items
  static async getAll() {
    const result = await pool.query(`
      SELECT i.*, c.name as category_name 
      FROM items i
      JOIN categories c ON i.category_id = c.category_id
      ORDER BY i.name
    `);
    return result.rows;
  }

  // Get item by ID
  static async getById(id) {
    const result = await pool.query(`
      SELECT i.*, c.name as category_name 
      FROM items i
      JOIN categories c ON i.category_id = c.category_id
      WHERE i.item_id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  // Get items by category ID
  static async getByCategoryId(categoryId) {
    const result = await pool.query(`
      SELECT i.*, c.name as category_name 
      FROM items i
      JOIN categories c ON i.category_id = c.category_id
      WHERE i.category_id = $1
      ORDER BY i.name
    `, [categoryId]);
    return result.rows;
  }

  // Create a new item
  static async create(name, categoryId, maxQuantity = 100, initialQuantity = 0) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(`
        INSERT INTO items (name, category_id, max_quantity, current_quantity) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `, [name, categoryId, maxQuantity, initialQuantity]);
      
      if (initialQuantity > 0) {
        await client.query(`
          UPDATE categories
          SET current_capacity = current_capacity + $1
          WHERE category_id = $2
        `, [initialQuantity, categoryId]);
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Update item quantity (also updates category capacity)
  static async updateQuantity(id, quantityChange) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const itemQuery = await client.query('SELECT * FROM items WHERE item_id = $1', [id]);
      const item = itemQuery.rows[0];
      
      if (!item) {
        throw new Error('Item not found');
      }
      
      const result = await client.query(`
        UPDATE items 
        SET current_quantity = current_quantity + $1 
        WHERE item_id = $2 
        RETURNING *
      `, [quantityChange, id]);
      
      await client.query(`
        UPDATE categories
        SET current_capacity = current_capacity + $1
        WHERE category_id = $2
      `, [quantityChange, item.category_id]);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Delete item (also updates category capacity)
  static async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const itemQuery = await client.query('SELECT * FROM items WHERE item_id = $1', [id]);
      const item = itemQuery.rows[0];
      
      if (!item) {
        throw new Error('Item not found');
      }
      
      if (item.current_quantity > 0) {
        await client.query(`
          UPDATE categories
          SET current_capacity = current_capacity - $1
          WHERE category_id = $2
        `, [item.current_quantity, item.category_id]);
      }
      
      await client.query('DELETE FROM items WHERE item_id = $1', [id]);
      
      await client.query('COMMIT');
      return item;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = Item;