const { pool } = require('../config/db');

class Item {
  // Get all items
  static async getAll() {
    try {
      console.log('Fetching all items');
      const result = await pool.query(`
        SELECT i.*, c.name as category_name 
        FROM items i
        JOIN categories c ON i.category_id = c.category_id
        ORDER BY i.name
      `);
      console.log(`Retrieved ${result.rowCount} items`);
      return result.rows;
    } catch (err) {
      console.error('Error in Item.getAll():', err);
      throw new Error(`Error fetching items: ${err.message}`);
    }
  }

  // Get item by ID
  static async getById(id) {
    try {
      console.log(`Fetching item with ID: ${id}`);
      const result = await pool.query(`
        SELECT i.*, c.name as category_name 
        FROM items i
        JOIN categories c ON i.category_id = c.category_id
        WHERE i.item_id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        console.log(`Item with ID ${id} not found`);
        return null;
      }
      
      console.log(`Retrieved item: ${result.rows[0].name}`);
      return result.rows[0];
    } catch (err) {
      console.error(`Error in Item.getById(${id}):`, err);
      throw new Error(`Error fetching item: ${err.message}`);
    }
  }

  // Get items by category ID
  static async getByCategoryId(categoryId) {
    try {
      console.log(`Fetching items for category ID: ${categoryId}`);
      const result = await pool.query(`
        SELECT i.*, c.name as category_name 
        FROM items i
        JOIN categories c ON i.category_id = c.category_id
        WHERE i.category_id = $1
        ORDER BY i.name
      `, [categoryId]);
      console.log(`Retrieved ${result.rowCount} items for category ID ${categoryId}`);
      return result.rows;
    } catch (err) {
      console.error(`Error in Item.getByCategoryId(${categoryId}):`, err);
      throw new Error(`Error fetching items by category: ${err.message}`);
    }
  }

  // Create a new item
  static async create(name, categoryId, maxQuantity = 100, initialQuantity = 0) {
    const client = await pool.connect();
    try {
      console.log(`Creating new item: ${name} in category ${categoryId}`);
      await client.query('BEGIN');
      
      const result = await client.query(`
        INSERT INTO items (name, category_id, max_quantity, current_quantity) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `, [name, categoryId, maxQuantity, initialQuantity]);
      
      // If initial quantity > 0, update category capacity
      if (initialQuantity > 0) {
        console.log(`Setting initial quantity of ${initialQuantity} for new item`);
        await client.query(`
          UPDATE categories
          SET current_capacity = current_capacity + $1
          WHERE category_id = $2
        `, [initialQuantity, categoryId]);
      }
      
      await client.query('COMMIT');
      console.log(`Successfully created item: ${result.rows[0].name} with ID ${result.rows[0].item_id}`);
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Error in Item.create(${name}, ${categoryId}):`, err);
      throw new Error(`Error creating item: ${err.message}`);
    } finally {
      client.release();
    }
  }

  // Update item quantity
  static async updateQuantity(id, quantityChange) {
    const client = await pool.connect();
    try {
      console.log(`Updating quantity for item ID ${id} by ${quantityChange}`);
      await client.query('BEGIN');
      
      // Get current item to know its category
      const itemQuery = await client.query('SELECT * FROM items WHERE item_id = $1', [id]);
      const item = itemQuery.rows[0];
      
      if (!item) {
        console.log(`Item with ID ${id} not found for quantity update`);
        throw new Error('Item not found');
      }
      
      // Update item quantity
      const result = await client.query(`
        UPDATE items 
        SET current_quantity = current_quantity + $1 
        WHERE item_id = $2 
        RETURNING *
      `, [quantityChange, id]);
      
      // Update category capacity
      await client.query(`
        UPDATE categories
        SET current_capacity = current_capacity + $1
        WHERE category_id = $2
      `, [quantityChange, item.category_id]);
      
      await client.query('COMMIT');
      console.log(`Successfully updated item quantity. New quantity: ${result.rows[0].current_quantity}`);
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Error in Item.updateQuantity(${id}, ${quantityChange}):`, err);
      throw new Error(`Error updating item quantity: ${err.message}`);
    } finally {
      client.release();
    }
  }

  // Check if item has enough quantity for sending
  static async checkQuantityForSend(id, requestedQuantity) {
    try {
      console.log(`Checking if item ID ${id} has enough quantity for sending ${requestedQuantity} units`);
      const result = await pool.query(
        'SELECT *, (current_quantity - $1) AS remaining_after_send FROM items WHERE item_id = $2',
        [requestedQuantity, id]
      );
      
      const item = result.rows[0];
      if (!item) {
        console.log(`Item with ID ${id} not found for send check`);
        throw new Error('Item not found');
      }
      
      const hasEnoughQuantity = item.current_quantity >= requestedQuantity;
      console.log(`Item ID ${id} has ${item.current_quantity} units. Requested: ${requestedQuantity}. Has enough: ${hasEnoughQuantity}`);
      
      return {
        ...item,
        hasEnoughQuantity,
        remainingAfterSend: Math.max(0, item.remaining_after_send)
      };
    } catch (err) {
      console.error(`Error in Item.checkQuantityForSend(${id}, ${requestedQuantity}):`, err);
      throw new Error(`Error checking item quantity: ${err.message}`);
    }
  }

  // Check if item has space for receiving
  static async checkSpaceForReceive(id, requestedQuantity) {
    try {
      console.log(`Checking if item ID ${id} has space for receiving ${requestedQuantity} units`);
      const result = await pool.query(
        'SELECT *, (max_quantity - current_quantity) AS available_space FROM items WHERE item_id = $1',
        [id]
      );
      
      const item = result.rows[0];
      if (!item) {
        console.log(`Item with ID ${id} not found for receive check`);
        throw new Error('Item not found');
      }
      
      const hasSpace = item.available_space >= requestedQuantity;
      console.log(`Item ID ${id} has ${item.available_space} units of space available. Requested: ${requestedQuantity}. Has space: ${hasSpace}`);
      
      return {
        ...item,
        hasSpace,
        availableSpace: item.available_space
      };
    } catch (err) {
      console.error(`Error in Item.checkSpaceForReceive(${id}, ${requestedQuantity}):`, err);
      throw new Error(`Error checking item space: ${err.message}`);
    }
  }
}

module.exports = Item;