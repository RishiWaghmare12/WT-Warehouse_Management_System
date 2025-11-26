const express = require('express');
const router = express.Router();
const ItemController = require('../controllers/itemController');

/**
 * @route   GET /api/items
 * @desc    Get all items with their details including max capacity, current quantity
 * @access  Public
 */
router.get('/', ItemController.getAllItems);

/**
 * @route   POST /api/items
 * @desc    Create a new item
 * @access  Public
 */
router.post('/', ItemController.createItem);

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete an item
 * @access  Public
 */
router.delete('/:id', ItemController.deleteItem);

module.exports = router;
