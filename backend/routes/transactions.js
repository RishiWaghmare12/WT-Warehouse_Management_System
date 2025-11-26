const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions
 * @access  Public
 */
router.get('/', TransactionController.getAllTransactions);

/**
 * @route   POST /api/transactions/send
 * @desc    Send items out of the warehouse
 * @access  Public
 */
router.post('/send', TransactionController.sendItems);

/**
 * @route   POST /api/transactions/receive
 * @desc    Receive items into the warehouse
 * @access  Public
 */
router.post('/receive', TransactionController.receiveItems);

module.exports = router;
