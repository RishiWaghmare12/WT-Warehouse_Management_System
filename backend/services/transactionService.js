const Transaction = require('../models/Transaction');
const ItemService = require('./itemService');
const CategoryService = require('./categoryService');

class TransactionService {
  static async getAll() {
    const transactions = await Transaction.find()
      .populate({
        path: 'item_id',
        populate: { path: 'category_id', select: 'name' }
      })
      .sort({ transaction_date: -1 });

    return transactions.map(t => ({
      id: t._id.toString(),
      itemId: t.item_id._id.toString(),
      itemName: t.item_id.name,
      categoryName: t.item_id.category_id.name,
      quantity: t.quantity,
      type: t.transaction_type,
      date: t.transaction_date
    }));
  }

  static async create(itemId, quantity, type) {
    const transaction = await Transaction.create({
      item_id: itemId,
      quantity,
      transaction_type: type,
      transaction_date: new Date()
    });

    return {
      id: transaction._id.toString(),
      itemId,
      quantity: transaction.quantity,
      type: transaction.transaction_type,
      date: transaction.transaction_date
    };
  }

  static async sendItems(itemId, quantity) {
    const item = await ItemService.getById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.currentQuantity < quantity) {
      const error = new Error(`Not enough quantity. Available: ${item.currentQuantity}`);
      error.availableQuantity = item.currentQuantity;
      error.statusCode = 400;
      throw error;
    }

    const updatedItem = await ItemService.updateQuantity(itemId, -quantity);
    const transaction = await this.create(itemId, quantity, 'SEND');

    return { item: updatedItem, transaction };
  }

  static async receiveItems({ itemId, categoryId, itemName, quantity }) {
    let targetItem;

    if (itemId) {
      targetItem = await ItemService.getById(itemId);
      if (!targetItem) {
        throw new Error('Item not found');
      }

      if (targetItem.availableSpace < quantity) {
        const error = new Error(`Item capacity exceeded. Available: ${targetItem.availableSpace}`);
        error.availableSpace = targetItem.availableSpace;
        error.statusCode = 400;
        throw error;
      }

      const category = await CategoryService.getById(targetItem.categoryId);
      if (category.available_space < quantity) {
        const error = new Error(`Compartment capacity exceeded. Available: ${category.available_space}`);
        error.availableSpace = category.available_space;
        error.statusCode = 400;
        throw error;
      }
    } else if (categoryId && itemName) {
      const category = await CategoryService.getById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      if (category.available_space < quantity) {
        const error = new Error(`Compartment capacity exceeded. Available: ${category.available_space}`);
        error.availableSpace = category.available_space;
        error.statusCode = 400;
        throw error;
      }

      if (quantity > 100) {
        const error = new Error('Cannot receive more than 100 units for new item');
        error.statusCode = 400;
        throw error;
      }

      targetItem = await ItemService.create(itemName, categoryId);
    } else {
      const error = new Error('Either itemId or both categoryId and itemName required');
      error.statusCode = 400;
      throw error;
    }

    const updatedItem = await ItemService.updateQuantity(targetItem.id, quantity);
    const transaction = await this.create(updatedItem.id, quantity, 'RECEIVE');

    return { item: updatedItem, transaction };
  }
}

module.exports = TransactionService;
