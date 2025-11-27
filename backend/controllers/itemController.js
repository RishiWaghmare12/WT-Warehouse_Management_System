const ItemService = require('../services/itemService');

class ItemController {
  static async getAllItems(req, res, next) {
    try {
      const data = await ItemService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createItem(req, res, next) {
    try {
      const { name, categoryId, maxQuantity, initialQuantity } = req.body;

      if (!name || !categoryId) {
        return res.status(400).json({
          success: false,
          error: 'Name and category are required'
        });
      }

      const maxQty = maxQuantity || 100;
      const initialQty = initialQuantity || 0;

      if (initialQty > maxQty) {
        return res.status(400).json({
          success: false,
          error: 'Initial quantity cannot exceed maximum quantity'
        });
      }

      const data = await ItemService.create(name, categoryId, maxQty, initialQty);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteItem(req, res, next) {
    try {
      const data = await ItemService.delete(req.params.id);
      res.json({
        success: true,
        message: `Item "${data.name}" deleted successfully`,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ItemController;
