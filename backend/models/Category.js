const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class Category {
  static getCollection() {
    return getDb().collection('categories');
  }

  // Get all categories with calculated available space
  static async getAllWithAvailableSpace() {
    const categories = await this.getCollection()
      .aggregate([
        {
          $addFields: {
            available_space: { $subtract: ['$max_capacity', '$current_capacity'] }
          }
        },
        { $sort: { name: 1 } }
      ])
      .toArray();
    
    // Map _id to category_id for API compatibility
    return categories.map(cat => ({
      category_id: cat._id.toString(),
      name: cat.name,
      max_capacity: cat.max_capacity,
      current_capacity: cat.current_capacity,
      available_space: cat.available_space
    }));
  }

  // Get category by ID with calculated available space
  static async getByIdWithAvailableSpace(id) {
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (err) {
      return null;
    }

    const categories = await this.getCollection()
      .aggregate([
        { $match: { _id: objectId } },
        {
          $addFields: {
            available_space: { $subtract: ['$max_capacity', '$current_capacity'] }
          }
        }
      ])
      .toArray();

    if (categories.length === 0) return null;

    const cat = categories[0];
    return {
      category_id: cat._id.toString(),
      name: cat.name,
      max_capacity: cat.max_capacity,
      current_capacity: cat.current_capacity,
      available_space: cat.available_space
    };
  }

  // Update category capacity atomically
  static async updateCapacity(id, change) {
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (err) {
      throw new Error('Invalid category ID');
    }

    const result = await this.getCollection().updateOne(
      { _id: objectId },
      { $inc: { current_capacity: change } }
    );

    if (result.matchedCount === 0) {
      throw new Error('Category not found');
    }
  }
}

module.exports = Category;
