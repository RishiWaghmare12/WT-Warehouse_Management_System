const Category = require('../models/Category');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

class TransactionController {
  // Get all transactions
  static async getAllTransactions(req, res) {
    try {
      const transactions = await Transaction.getAll();
      const formattedTransactions = transactions.map(transaction => ({
        id: transaction.transaction_id,
        itemId: transaction.item_id,
        itemName: transaction.item_name,
        categoryName: transaction.category_name,
        quantity: transaction.quantity,
        type: transaction.transaction_type,
        date: transaction.transaction_date
      }));
      
      res.json({
        success: true,
        data: formattedTransactions
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Send items out of the warehouse
  static async sendItems(req, res) {
    try {
      const { itemId, quantity } = req.body;
      
      // Validate input
      if (!itemId || !quantity) {
        return res.status(400).json({
          success: false,
          error: 'Item ID and quantity are required'
        });
      }
      
      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Quantity must be greater than 0'
        });
      }
      
      // Check if item exists
      const item = await Item.getById(itemId);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }
      
      // Check if item has enough quantity
      if (item.current_quantity < quantity) {
        return res.status(400).json({
          success: false,
          error: `Not enough quantity available. Requested: ${quantity}, Available: ${item.current_quantity}`,
          availableQuantity: item.current_quantity
        });
      }
      
      // Update item quantity (negative value for sending out)
      const updatedItem = await Item.updateQuantity(itemId, -quantity);
      
      // Create transaction record
      const transaction = await Transaction.create(itemId, quantity, 'SEND');
      
      res.json({
        success: true,
        message: `Successfully sent ${quantity} units of ${updatedItem.name}`,
        data: {
          transaction: {
            id: transaction.transaction_id,
            type: transaction.transaction_type,
            quantity: transaction.quantity,
            date: transaction.transaction_date
          },
          item: {
            id: updatedItem.item_id,
            name: updatedItem.name,
            currentQuantity: updatedItem.current_quantity,
            previousQuantity: updatedItem.current_quantity + quantity
          }
        }
      });
    } catch (error) {
      console.error('Error sending items:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Receive items into the warehouse
  static async receiveItems(req, res) {
    try {
      const { itemId, categoryId, itemName, quantity } = req.body;
      
      // Validate quantity
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Quantity must be greater than 0'
        });
      }
      
      let targetItem;
      
      // Handle existing item
      if (itemId) {
        targetItem = await Item.getById(itemId);
        if (!targetItem) {
          return res.status(404).json({
            success: false,
            error: 'Item not found'
          });
        }
        
        // Check if item has space
        const itemAvailableSpace = targetItem.max_quantity - targetItem.current_quantity;
        if (itemAvailableSpace < quantity) {
          return res.status(400).json({
            success: false,
            error: `Item has reached its maximum capacity. Available space: ${itemAvailableSpace}`,
            availableSpace: itemAvailableSpace
          });
        }
        
        // Check if category has space
        const category = await Category.getByIdWithAvailableSpace(targetItem.category_id);
        if (category.available_space < quantity) {
          return res.status(400).json({
            success: false,
            error: `Compartment has reached its maximum capacity. Available space: ${category.available_space}`,
            availableSpace: category.available_space
          });
        }
      }
      // Handle new item
      else if (categoryId && itemName) {
        const category = await Category.getByIdWithAvailableSpace(categoryId);
        if (!category) {
          return res.status(404).json({
            success: false,
            error: 'Category/Compartment not found'
          });
        }
        
        // Check if category has space
        if (category.available_space < quantity) {
          return res.status(400).json({
            success: false,
            error: `Compartment has reached its maximum capacity. Available space: ${category.available_space}`,
            availableSpace: category.available_space
          });
        }
        
        // Default max quantity for new items is 100
        if (quantity > 100) {
          return res.status(400).json({
            success: false,
            error: `Cannot receive more than maximum item capacity (100 units). Requested: ${quantity}`,
            maxItemCapacity: 100
          });
        }
        
        // Create new item
        targetItem = await Item.create(itemName, categoryId);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Either itemId or both categoryId and itemName are required'
        });
      }
      
      // Update item quantity
      const updatedItem = await Item.updateQuantity(targetItem.item_id, quantity);
      
      // Create transaction record
      const transaction = await Transaction.create(updatedItem.item_id, quantity, 'RECEIVE');
      
      res.json({
        success: true,
        message: `Successfully received ${quantity} units of ${updatedItem.name}`,
        data: {
          transaction: {
            id: transaction.transaction_id,
            type: transaction.transaction_type,
            quantity: transaction.quantity,
            date: transaction.transaction_date
          },
          item: {
            id: updatedItem.item_id,
            name: updatedItem.name,
            currentQuantity: updatedItem.current_quantity,
            previousQuantity: updatedItem.current_quantity - quantity
          }
        }
      });
    } catch (error) {
      console.error('Error receiving items:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = TransactionController;
