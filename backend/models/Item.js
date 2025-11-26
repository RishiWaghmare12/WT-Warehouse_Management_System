const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const Category = require('./Category');

class Item {
  static getCollection() {
    return getDb().collection('items');
  }

  // Get all items with category name
  static async getAll() {
    const items = await this.getCollection()
      .aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $addFields: {
            category_name: '$category.name'
          }
        },
        { $project: { category: 0 } },
        { $sort: { name: 1 } }
      ])
      .toArray();

    return items.map(item => ({
      item_id: item._id.toString(),
      name: item.name,
      category_id: item.category_id.toString(),
      max_quantity: item.max_quantity,
      current_quantity: item.current_quantity,
      category_name: item.category_name
    }));
  }

  // Get item by ID with category name
  static async getById(id) {
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (err) {
      return null;
    }

    const items = await this.getCollection()
      .aggregate([
        { $match: { _id: objectId } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $addFields: {
            category_name: '$category.name'
          }
        },
        { $project: { category: 0 } }
      ])
      .toArray();

    if (items.length === 0) return null;

    const item = items[0];
    return {
      item_id: item._id.toString(),
      name: item.name,
      category_id: item.category_id.toString(),
      max_quantity: item.max_quantity,
      current_quantity: item.current_quantity,
      category_name: item.category_name
    };
  }


  // Get items by category ID
  static async getByCategoryId(categoryId) {
    let objectId;
    try {
      objectId = new ObjectId(categoryId);
    } catch (err) {
      return [];
    }

    const items = await this.getCollection()
      .aggregate([
        { $match: { category_id: objectId } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $addFields: {
            category_name: '$category.name'
          }
        },
        { $project: { category: 0 } },
        { $sort: { name: 1 } }
      ])
      .toArray();

    return items.map(item => ({
      item_id: item._id.toString(),
      name: item.name,
      category_id: item.category_id.toString(),
      max_quantity: item.max_quantity,
      current_quantity: item.current_quantity,
      category_name: item.category_name
    }));
  }

  // Create a new item with atomic category capacity update
  static async create(name, categoryId, maxQuantity = 100, initialQuantity = 0) {
    let categoryObjectId;
    try {
      categoryObjectId = new ObjectId(categoryId);
    } catch (err) {
      throw new Error('Invalid category ID');
    }

    const newItem = {
      name,
      category_id: categoryObjectId,
      max_quantity: maxQuantity,
      current_quantity: initialQuantity
    };

    const result = await this.getCollection().insertOne(newItem);

    if (initialQuantity > 0) {
      await Category.updateCapacity(categoryId, initialQuantity);
    }

    return {
      item_id: result.insertedId.toString(),
      name: newItem.name,
      category_id: categoryId,
      max_quantity: newItem.max_quantity,
      current_quantity: newItem.current_quantity
    };
  }

  // Update item quantity with atomic category capacity update
  static async updateQuantity(id, quantityChange) {
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (err) {
      throw new Error('Invalid item ID');
    }

    const item = await this.getCollection().findOne({ _id: objectId });
    if (!item) {
      throw new Error('Item not found');
    }

    await this.getCollection().updateOne(
      { _id: objectId },
      { $inc: { current_quantity: quantityChange } }
    );

    await Category.updateCapacity(item.category_id.toString(), quantityChange);

    const updatedItem = await this.getCollection().findOne({ _id: objectId });
    return {
      item_id: updatedItem._id.toString(),
      name: updatedItem.name,
      category_id: updatedItem.category_id.toString(),
      max_quantity: updatedItem.max_quantity,
      current_quantity: updatedItem.current_quantity
    };
  }

  // Delete item with atomic category capacity adjustment
  static async delete(id) {
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (err) {
      throw new Error('Invalid item ID');
    }

    const item = await this.getCollection().findOne({ _id: objectId });
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.current_quantity > 0) {
      await Category.updateCapacity(item.category_id.toString(), -item.current_quantity);
    }

    await this.getCollection().deleteOne({ _id: objectId });

    return {
      item_id: item._id.toString(),
      name: item.name,
      category_id: item.category_id.toString(),
      max_quantity: item.max_quantity,
      current_quantity: item.current_quantity
    };
  }
}

module.exports = Item;
