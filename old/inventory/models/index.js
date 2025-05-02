const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Import models
const Supplier = require('./Supplier');
const Ingredient = require('./Ingredient');
const Inventory = require('./Inventory');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const IngredientConsumption = require('./IngredientConsumption');

// Define associations
Inventory.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Ingredient.hasOne(Inventory, { foreignKey: 'ingredientId' });

PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId' });

PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId' });

PurchaseOrderItem.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Ingredient.hasMany(PurchaseOrderItem, { foreignKey: 'ingredientId' });

IngredientConsumption.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Ingredient.hasMany(IngredientConsumption, { foreignKey: 'ingredientId' });

module.exports = {
  sequelize,
  Supplier,
  Ingredient,
  Inventory,
  PurchaseOrder,
  PurchaseOrderItem,
  IngredientConsumption
};