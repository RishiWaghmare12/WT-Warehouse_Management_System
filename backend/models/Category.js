const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100
  },
  max_capacity: {
    type: Number,
    required: true,
    default: 500
  },
  current_capacity: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

// Virtual for available space
categorySchema.virtual('available_space').get(function() {
  return this.max_capacity - this.current_capacity;
});

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
