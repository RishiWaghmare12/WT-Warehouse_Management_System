const TransactionService = require('../services/transactionService');

class TransactionController {
  static async getAllTransactions(req, res, next) {
    try {
      const data = await TransactionService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async sendItems(req, res, next) {
    try {
      const { itemId, quantity } = req.body;

      if (!itemId || !quantity) {
        return res.status(400).json({
          success: false,
          error: 'Item ID and quantity are required'
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Quantity must be greater than 0'
        });
      }

      const { item, transaction } = await TransactionService.sendItems(itemId, quantity);

      res.json({
        success: true,
        message: `Successfully sent ${quantity} units of ${item.name}`,
        data: { transaction, item }
      });
    } catch (error) {
      next(error);
    }
  }

  static async receiveItems(req, res, next) {
    try {
      const { itemId, categoryId, itemName, quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Quantity must be greater than 0'
        });
      }

      const { item, transaction } = await TransactionService.receiveItems({
        itemId,
        categoryId,
        itemName,
        quantity
      });

      res.json({
        success: true,
        message: `Successfully received ${quantity} units of ${item.name}`,
        data: { transaction, item }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionController;
