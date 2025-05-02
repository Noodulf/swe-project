const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CashBalance = sequelize.define('CashBalance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  month: {
    type: DataTypes.DATE,
    allowNull: false,
    unique: true
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 100000.00 // Starting balance of 1,00,000
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'cash_balances', // Explicitly set table name to lowercase
  underscored: true // This will make all column names use snake_case
});

module.exports = CashBalance; 