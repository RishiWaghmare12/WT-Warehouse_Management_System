const Category = require('../models/Category');
const Item = require('../models/Item');

class CategoryService {
  static async getAll() {
    return Category.find().sort({ name: 1 });
  }

  static async getById(id) {
    return Category.findById(id);
  }

  static async getAllWithItems() {
    const categories = await this.getAll();
    
    return Promise.all(
      categories.map(async (category) => {
        const items = await Item.find({ category_id: category._id }).sort({ name: 1 });
        return {
          id: category._id.toString(),
          name: category.name,
          maxCapacity: category.max_capacity,
          currentCapacity: category.current_capacity,
          availableSpace: category.available_space,
          utilizationPercentage: Math.round((category.current_capacity / category.max_capacity) * 100),
          items: items.map(item => ({
            id: item._id.toString(),
            name: item.name,
            maxQuantity: item.max_quantity,
            currentQuantity: item.current_quantity,
            availableSpace: item.max_quantity - item.current_quantity
          }))
        };
      })
    );
  }

  static async updateCapacity(id, change) {
    const category = await Category.findByIdAndUpdate(
      id,
      { $inc: { current_capacity: change } },
      { new: true }
    );
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    return category;
  }
}

module.exports = CategoryService;
