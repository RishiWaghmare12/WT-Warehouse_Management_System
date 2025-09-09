const { pool } = require('../config/db');

class Category {
  // Get all categories
  static async getAll() {
    try {
      console.log('Fetching all categories');
      const result = await pool.query('SELECT * FROM categories ORDER BY name');
      console.log(`Retrieved ${result.rowCount} categories`);
      return result.rows;
    } catch (err) {
      console.error('Error in Category.getAll():', err);
      throw new Error(`Error fetching categories: ${err.message}`);
    }
  }

  // Get category by ID
  static async getById(id) {
    try {
      console.log(`Fetching category with ID: ${id}`);
      const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]);
      
      if (result.rows.length === 0) {
        console.log(`Category with ID ${id} not found`);
        return null;
      }
      
      console.log(`Retrieved category: ${result.rows[0].name}`);
      return result.rows[0];
    } catch (err) {
      console.error(`Error in Category.getById(${id}):`, err);
      throw new Error(`Error fetching category: ${err.message}`);
    }
  }

  // Update category capacity
  static async updateCapacity(id, capacityChange) {
    try {
      console.log(`Updating capacity for category ID ${id} by ${capacityChange}`);
      const result = await pool.query(
        'UPDATE categories SET current_capacity = current_capacity + $1 WHERE category_id = $2 RETURNING *',
        [capacityChange, id]
      );
      
      if (result.rows.length === 0) {
        console.log(`Category with ID ${id} not found for capacity update`);
        throw new Error('Category not found');
      }
      
      console.log(`Successfully updated category capacity. New capacity: ${result.rows[0].current_capacity}`);
      return result.rows[0];
    } catch (err) {
      console.error(`Error in Category.updateCapacity(${id}, ${capacityChange}):`, err);
      throw new Error(`Error updating category capacity: ${err.message}`);
    }
  }

  // Get category with available space check
  static async checkAvailableSpace(id, requiredSpace) {
    try {
      console.log(`Checking if category ID ${id} has space for ${requiredSpace} units`);
      const result = await pool.query(
        'SELECT *, (max_capacity - current_capacity) AS available_space FROM categories WHERE category_id = $1',
        [id]
      );
      
      const category = result.rows[0];
      if (!category) {
        console.log(`Category with ID ${id} not found for space check`);
        throw new Error('Category not found');
      }
      
      const hasSpace = category.available_space >= requiredSpace;
      console.log(`Category ID ${id} has ${category.available_space} units of space available. Required: ${requiredSpace}. Has space: ${hasSpace}`);
      
      return {
        ...category,
        hasSpace
      };
    } catch (err) {
      console.error(`Error in Category.checkAvailableSpace(${id}, ${requiredSpace}):`, err);
      throw new Error(`Error checking category space: ${err.message}`);
    }
  }

  // Get all categories with their available space
  static async getAllWithAvailableSpace() {
    try {
      console.log('Fetching all categories with available space');
      const result = await pool.query(
        'SELECT *, (max_capacity - current_capacity) AS available_space FROM categories ORDER BY name'
      );
      console.log(`Retrieved ${result.rowCount} categories with available space`);
      return result.rows;
    } catch (err) {
      console.error('Error in Category.getAllWithAvailableSpace():', err);
      throw new Error(`Error fetching categories with space: ${err.message}`);
    }
  }
}

module.exports = Category;