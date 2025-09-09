const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

/**
 * @route   GET /api/items
 * @desc    Get all items with their details including max capacity, current quantity
 * @access  Public
 */
router.get('/', async (req, res) => {
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
});

/**
 * @route   GET /api/items/:id
 * @desc    Get a specific item by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.getById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: item.item_id,
        name: item.name,
        categoryId: item.category_id,
        categoryName: item.category_name,
        maxQuantity: item.max_quantity,
        currentQuantity: item.current_quantity,
        availableSpace: item.max_quantity - item.current_quantity
      }
    });
  } catch (error) {
    console.error(`Error fetching item ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/items/category/:categoryId
 * @desc    Get all items in a specific category
 * @access  Public
 */
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const items = await Item.getByCategoryId(categoryId);
    
    res.json({
      success: true,
      data: items.map(item => ({
        id: item.item_id,
        name: item.name,
        categoryId: item.category_id,
        categoryName: item.category_name,
        maxQuantity: item.max_quantity,
        currentQuantity: item.current_quantity,
        availableSpace: item.max_quantity - item.current_quantity
      }))
    });
  } catch (error) {
    console.error(`Error fetching items for category ${req.params.categoryId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
