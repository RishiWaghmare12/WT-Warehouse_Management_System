const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  max_quantity: {
    type: Number,
    required: true,
    default: 100
  },
  current_quantity: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

itemSchema.index({ name: 1, category_id: 1 }, { unique: true });

module.exports = mongoose.model('Item', itemSchema);
