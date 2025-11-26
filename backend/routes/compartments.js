const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

/**
 * @route   GET /api/compartments
 * @desc    Get all compartments with their items (detailed report)
 * @access  Public
 */
router.get('/', CategoryController.getAllCompartments);

module.exports = router;
