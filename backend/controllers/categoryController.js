const CategoryService = require('../services/categoryService');

class CategoryController {
  static async getAllCompartments(req, res, next) {
    try {
      const data = await CategoryService.getAllWithItems();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
