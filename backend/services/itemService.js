const Item = require('../models/Item');
const CategoryService = require('./categoryService');

class ItemService {
  static async getAll() {
    const items = await Item.find()
      .populate('category_id', 'name')
      .sort({ name: 1 });
    
    return items.map(item => ({
      id: item._id.toString(),
      name: item.name,
      categoryId: item.category_id._id.toString(),
      categoryName: item.category_id.name,
      maxQuantity: item.max_quantity,
      currentQuantity: item.current_quantity,
      availableSpace: item.max_quantity - item.current_quantity
    }));
  }

  static async getById(id) {
    const item = await Item.findById(id).populate('category_id', 'name');
    if (!item) return null;
    
    return {
      id: item._id.toString(),
      name: item.name,
      categoryId: item.category_id._id.toString(),
      categoryName: item.category_id.name,
      maxQuantity: item.max_quantity,
      currentQuantity: item.current_quantity,
      availableSpace: item.max_quantity - item.current_quantity
    };
  }

  static async create(name, categoryId, maxQuantity = 100, initialQuantity = 0) {
    const item = await Item.create({
      name,
      category_id: categoryId,
      max_quantity: maxQuantity,
      current_quantity: initialQuantity
    });

    if (initialQuantity > 0) {
      await CategoryService.updateCapacity(categoryId, initialQuantity);
    }

    return {
      id: item._id.toString(),
      name: item.name,
      categoryId: categoryId,
      maxQuantity: item.max_quantity,
      currentQuantity: item.current_quantity,
      availableSpace: item.max_quantity - item.current_quantity
    };
  }

  static async updateQuantity(id, quantityChange) {
    const item = await Item.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }

    item.current_quantity += quantityChange;
    await item.save();

    await CategoryService.updateCapacity(item.category_id.toString(), quantityChange);

    return {
      id: item._id.toString(),
      name: item.name,
      categoryId: item.category_id.toString(),
      maxQuantity: item.max_quantity,
      currentQuantity: item.current_quantity,
      availableSpace: item.max_quantity - item.current_quantity
    };
  }

  static async delete(id) {
    const item = await Item.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.current_quantity > 0) {
      await CategoryService.updateCapacity(item.category_id.toString(), -item.current_quantity);
    }

    await Item.findByIdAndDelete(id);

    return {
      id: item._id.toString(),
      name: item.name
    };
  }
}

module.exports = ItemService;
