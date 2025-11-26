const Category = require('../models/Category');
const Item = require('../models/Item');

class CategoryController {
  // Get all compartments with their items
  static async getAllCompartments(req, res) {
    try {
      const categories = await Category.getAllWithAvailableSpace();
      
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
  }
}

module.exports = CategoryController;
