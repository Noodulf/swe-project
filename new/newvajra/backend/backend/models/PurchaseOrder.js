// models/PurchaseOrder.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  purchaseOrderId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  approvedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  receivedDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'purchase_orders',
  timestamps: true
});

// Remove supplier association if present
// PurchaseOrder.belongsTo(require('./Supplier'), { foreignKey: 'supplierId' });

module.exports = PurchaseOrder;