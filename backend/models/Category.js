const { pool } = require('../config/db');

class Category {
  // Get all categories with calculated available space
  static async getAllWithAvailableSpace() {
    const result = await pool.query(
      'SELECT *, (max_capacity - current_capacity) AS available_space FROM categories ORDER BY name'
    );
    return result.rows;
  }

  // Get category with calculated available space
  static async getByIdWithAvailableSpace(id) {
    const result = await pool.query(
      'SELECT *, (max_capacity - current_capacity) AS available_space FROM categories WHERE category_id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = Category;