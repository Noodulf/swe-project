const CashBalance = require('../models/cashBalance');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Get current month's cash balance
exports.getCurrentBalance = async (req, res) => {
  try {
    console.log('Fetching current balance...');
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    console.log('Date range:', {
      firstDayOfMonth,
      lastDayOfMonth
    });

    let cashBalance = await CashBalance.findOne({
      where: {
        month: {
          [Op.gte]: firstDayOfMonth,
          [Op.lt]: lastDayOfMonth
        }
      }
    });

    console.log('Found balance:', cashBalance);

    // If no balance record exists for current month, create one with default balance
    if (!cashBalance) {
      console.log('No balance found, creating new one...');
      cashBalance = await CashBalance.create({
        month: firstDayOfMonth,
        balance: 100000.00,
        last_updated: new Date()
      });
      console.log('New balance created:', cashBalance);
    }

    res.json({
      success: true,
      balance: cashBalance.balance
    });
  } catch (error) {
    console.error('Error in getCurrentBalance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cash balance',
      error: error.message
    });
  }
};

// Update cash balance
exports.updateBalance = async (amount) => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  try {
    console.log('Updating balance...', {
      amount,
      firstDayOfMonth,
      lastDayOfMonth
    });

    let cashBalance = await CashBalance.findOne({
      where: {
        month: {
          [Op.gte]: firstDayOfMonth,
          [Op.lt]: lastDayOfMonth
        }
      }
    });

    console.log('Found balance:', cashBalance);

    // If no balance record exists for current month, create one with default balance
    if (!cashBalance) {
      console.log('No balance found, creating new one...');
      cashBalance = await CashBalance.create({
        month: firstDayOfMonth,
        balance: 100000.00,
        last_updated: new Date()
      });
      console.log('New balance created:', cashBalance);
    }

    // Update balance
    const newBalance = parseFloat(cashBalance.balance) + parseFloat(amount);
    
    console.log('Calculating new balance:', {
      currentBalance: cashBalance.balance,
      amount,
      newBalance
    });

    // Check if new balance would be negative
    if (newBalance < 0) {
      throw new Error('Insufficient funds');
    }

    await cashBalance.update({
      balance: newBalance,
      last_updated: new Date()
    });

    console.log('Balance updated successfully:', newBalance);

    return newBalance;
  } catch (error) {
    console.error('Error in updateBalance:', error);
    throw error;
  }
};

// Get balance history
exports.getBalanceHistory = async (req, res) => {
  try {
    console.log('Fetching balance history...');
    const balances = await CashBalance.findAll({
      order: [['month', 'DESC']],
      limit: 12 // Last 12 months
    });

    console.log('Found balances:', balances);

    res.json({
      success: true,
      balances
    });
  } catch (error) {
    console.error('Error in getBalanceHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch balance history',
      error: error.message
    });
  }
}; 