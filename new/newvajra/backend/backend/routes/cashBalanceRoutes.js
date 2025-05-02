const express = require('express');
const router = express.Router();
const {
  getCurrentBalance,
  getBalanceHistory
} = require('../controllers/cashBalanceController');

// Get current month's cash balance
router.get('/', getCurrentBalance);

// Get balance history
router.get('/history', getBalanceHistory);

module.exports = router; 