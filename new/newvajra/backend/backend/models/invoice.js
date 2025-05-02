const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const PurchaseOrder = require('./purchaseOrder');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'purchase_orders',
      key: 'purchaseOrderId'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('unpaid', 'paid'),
    defaultValue: 'unpaid'
  },
  cheque_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cheque_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'invoices',
  underscored: true,
  timestamps: true
});

// Define association with PurchaseOrder
Invoice.belongsTo(PurchaseOrder, { 
  foreignKey: 'purchase_order_id',
  targetKey: 'purchaseOrderId'
});
PurchaseOrder.hasOne(Invoice, { 
  foreignKey: 'purchase_order_id',
  sourceKey: 'purchaseOrderId'
});

module.exports = Invoice; 