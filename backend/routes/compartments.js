const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Item = require('../models/Item');

/**
 * @route   GET /api/compartments
 * @desc    Get all compartments with their items (detailed report)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAllWithAvailableSpace();
    
    // For each category, get its items
    const compartmentsData = await Promise.all(
      categories.map(async (category) => {
        const items = await Item.getByCategoryId(category.category_id);
        return {
          id: category.category_id,
          name: category.name,
          maxCapacity: category.max_capacity,
          currentCapacity: category.current_capacity,
          availableSpace: category.available_space,
          utilizationPercentage: Math.round((category.current_capacity / category.max_capacity) * 100),
          items: items.map(item => ({
            id: item.item_id,
            name: item.name,
            maxQuantity: item.max_quantity,
            currentQuantity: item.current_quantity,
            availableSpace: item.max_quantity - item.current_quantity
          }))
        };
      })
    );
    
    res.json({
      success: true,
      data: compartmentsData
    });
  } catch (error) {
    console.error('Error fetching compartments data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/compartments/:id
 * @desc    Get a specific compartment with its items
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.getById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Compartment not found'
      });
    }
    
    const items = await Item.getByCategoryId(id);
    const availableSpace = category.max_capacity - category.current_capacity;
    
    res.json({
      success: true,
      data: {
        id: category.category_id,
        name: category.name,
        maxCapacity: category.max_capacity,
        currentCapacity: category.current_capacity,
        availableSpace: availableSpace,
        utilizationPercentage: Math.round((category.current_capacity / category.max_capacity) * 100),
        items: items.map(item => ({
          id: item.item_id,
          name: item.name,
          maxQuantity: item.max_quantity,
          currentQuantity: item.current_quantity,
          availableSpace: item.max_quantity - item.current_quantity
        }))
      }
    });
  } catch (error) {
    console.error(`Error fetching compartment ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/compartments/available
 * @desc    Get available space in each compartment
 * @access  Public
 */
router.get('/available/space', async (req, res) => {
  try {
    const compartments = await Category.getAllWithAvailableSpace();
    const availabilityData = compartments.map(compartment => ({
      id: compartment.category_id,
      name: compartment.name,
      maxCapacity: compartment.max_capacity,
      currentCapacity: compartment.current_capacity,
      availableSpace: compartment.available_space,
      utilizationPercentage: Math.round((compartment.current_capacity / compartment.max_capacity) * 100)
    }));
    
    res.json({
      success: true,
      data: availabilityData
    });
  } catch (error) {
    console.error('Error fetching available space:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
