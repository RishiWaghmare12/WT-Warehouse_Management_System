const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions
 * @access  Public
 */
router.get('/', async (req, res) => {
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
});

/**
 * @route   GET /api/transactions/item/:itemId
 * @desc    Get transactions for a specific item
 * @access  Public
 */
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const transactions = await Transaction.getByItemId(itemId);
    
    res.json({
      success: true,
      data: transactions.map(transaction => ({
        id: transaction.transaction_id,
        itemId: transaction.item_id,
        itemName: transaction.item_name,
        quantity: transaction.quantity,
        type: transaction.transaction_type,
        date: transaction.transaction_date
      }))
    });
  } catch (error) {
    console.error(`Error fetching transactions for item ${req.params.itemId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/transactions/type/:type
 * @desc    Get transactions by type (SEND or RECEIVE)
 * @access  Public
 */
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    if (type !== 'SEND' && type !== 'RECEIVE') {
      return res.status(400).json({
        success: false,
        error: 'Transaction type must be either SEND or RECEIVE'
      });
    }
    
    const transactions = await Transaction.getByType(type);
    
    res.json({
      success: true,
      data: transactions.map(transaction => ({
        id: transaction.transaction_id,
        itemId: transaction.item_id,
        itemName: transaction.item_name,
        categoryName: transaction.category_name,
        quantity: transaction.quantity,
        type: transaction.transaction_type,
        date: transaction.transaction_date
      }))
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.type} transactions:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/transactions/send
 * @desc    Send items out of the warehouse
 * @access  Public
 */
router.post('/send', async (req, res) => {
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
    
    // Check if item exists and has enough quantity
    const item = await Item.checkQuantityForSend(itemId, quantity);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    if (!item.hasEnoughQuantity) {
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
});

/**
 * @route   POST /api/transactions/receive
 * @desc    Receive items into the warehouse
 * @access  Public
 */
router.post('/receive', async (req, res) => {
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
    let categorySpaceCheck;
    
    // Handle existing item
    if (itemId) {
      // Check if item exists
      targetItem = await Item.getById(itemId);
      if (!targetItem) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }
      
      // Check if item has space
      const itemSpaceCheck = await Item.checkSpaceForReceive(itemId, quantity);
      if (!itemSpaceCheck.hasSpace) {
        return res.status(400).json({
          success: false,
          error: `Item has reached its maximum capacity. Available space: ${itemSpaceCheck.availableSpace}`,
          availableSpace: itemSpaceCheck.availableSpace
        });
      }
      
      // Check if category has space
      categorySpaceCheck = await Category.checkAvailableSpace(targetItem.category_id, quantity);
      if (!categorySpaceCheck.hasSpace) {
        return res.status(400).json({
          success: false,
          error: `Compartment has reached its maximum capacity. Available space: ${categorySpaceCheck.available_space}`,
          availableSpace: categorySpaceCheck.available_space
        });
      }
    }
    // Handle new item
    else if (categoryId && itemName) {
      // Check if category exists
      const category = await Category.getById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category/Compartment not found'
        });
      }
      
      // Check if category has space
      categorySpaceCheck = await Category.checkAvailableSpace(categoryId, quantity);
      if (!categorySpaceCheck.hasSpace) {
        return res.status(400).json({
          success: false,
          error: `Compartment has reached its maximum capacity. Available space: ${categorySpaceCheck.available_space}`,
          availableSpace: categorySpaceCheck.available_space
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
});

module.exports = router;
