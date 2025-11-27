const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  transaction_type: {
    type: String,
    required: true,
    enum: ['SEND', 'RECEIVE']
  },
  transaction_date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { timestamps: true });

transactionSchema.index({ item_id: 1 });
transactionSchema.index({ transaction_date: -1 });
transactionSchema.index({ transaction_type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
