// models/PurchaseOrderItem.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const PurchaseOrder = require('./PurchaseOrder');
const Ingredient = require('./Ingredient');

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  purchaseOrderItemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchaseOrderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: PurchaseOrder,
      key: 'purchaseOrderId'
    }
  },
  ingredientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ingredient,
      key: 'ingredientId'
    }
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'purchase_order_items'
});

// Define associations
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId' });

PurchaseOrderItem.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Ingredient.hasMany(PurchaseOrderItem, { foreignKey: 'ingredientId' });

module.exports = PurchaseOrderItem;