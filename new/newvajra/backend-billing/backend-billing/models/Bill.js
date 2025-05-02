const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Bill = sequelize.define('Bill', {
  customerName: DataTypes.STRING,
  items: DataTypes.JSON,
  totalAmount: DataTypes.FLOAT,
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Bill;
