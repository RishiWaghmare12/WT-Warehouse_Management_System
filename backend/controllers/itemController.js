const Item = require('../models/Item');

class ItemController {
  // Get all items
  static async getAllItems(req, res) {
    try {
      const items = await Item.getAll();
      const formattedItems = items.map(item => ({
        id: item.item_id,
        name: item.name,
        categoryId: item.category_id,
        categoryName: item.category_name,
        maxQuantity: item.max_quantity,
        currentQuantity: item.current_quantity,
        availableSpace: item.max_quantity - item.current_quantity
      }));
      
      res.json({
        success: true,
        data: formattedItems
      });
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Create a new item
  static async createItem(req, res) {
    try {
      const { name, categoryId, maxQuantity, initialQuantity } = req.body;
      
      // Validation
      if (!name || !categoryId) {
        return res.status(400).json({
          success: false,
          error: 'Name and category are required'
        });
      }
      
      const maxQty = maxQuantity || 100;
      const initialQty = initialQuantity || 0;
      
      if (initialQty > maxQty) {
        return res.status(400).json({
          success: false,
          error: 'Initial quantity cannot exceed maximum quantity'
        });
      }
      
      const newItem = await Item.create(name, categoryId, maxQty, initialQty);
      
      res.status(201).json({
        success: true,
        data: {
          id: newItem.item_id,
          name: newItem.name,
          categoryId: newItem.category_id,
          maxQuantity: newItem.max_quantity,
          currentQuantity: newItem.current_quantity,
          availableSpace: newItem.max_quantity - newItem.current_quantity
        }
      });
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete an item
  static async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const deletedItem = await Item.delete(id);
      
      res.json({
        success: true,
        message: `Item "${deletedItem.name}" deleted successfully`,
        data: {
          id: deletedItem.item_id,
          name: deletedItem.name
        }
      });
    } catch (error) {
      console.error(`Error deleting item ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = ItemController;
