const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

class Transaction {
  static getCollection() {
    return getDb().collection('transactions');
  }

  // Create a new transaction
  static async create(itemId, quantity, type) {
    let itemObjectId;
    try {
      itemObjectId = new ObjectId(itemId);
    } catch (err) {
      throw new Error('Invalid item ID');
    }

    const newTransaction = {
      item_id: itemObjectId,
      quantity,
      transaction_type: type,
      transaction_date: new Date()
    };

    const result = await this.getCollection().insertOne(newTransaction);

    return {
      transaction_id: result.insertedId.toString(),
      item_id: itemId,
      quantity: newTransaction.quantity,
      transaction_type: newTransaction.transaction_type,
      transaction_date: newTransaction.transaction_date
    };
  }

  // Get all transactions with item and category names, sorted by date descending
  static async getAll() {
    const transactions = await this.getCollection()
      .aggregate([
        {
          $lookup: {
            from: 'items',
            localField: 'item_id',
            foreignField: '_id',
            as: 'item'
          }
        },
        { $unwind: '$item' },
        {
          $lookup: {
            from: 'categories',
            localField: 'item.category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $addFields: {
            item_name: '$item.name',
            category_name: '$category.name'
          }
        },
        { $project: { item: 0, category: 0 } },
        { $sort: { transaction_date: -1 } }
      ])
      .toArray();

    return transactions.map(t => ({
      transaction_id: t._id.toString(),
      item_id: t.item_id.toString(),
      quantity: t.quantity,
      transaction_type: t.transaction_type,
      transaction_date: t.transaction_date,
      item_name: t.item_name,
      category_name: t.category_name
    }));
  }
}

module.exports = Transaction;
