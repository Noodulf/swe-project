const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ingredient = require('./Ingredient');
const Inventory = require('./Inventory');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const IngredientConsumption = require('./IngredientConsumption');

Inventory.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId' });
PurchaseOrderItem.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Ingredient.hasMany(PurchaseOrderItem, { foreignKey: 'ingredientId' });
IngredientConsumption.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Ingredient.hasMany(IngredientConsumption, { foreignKey: 'ingredientId' });

module.exports = {
  sequelize,
  Ingredient,
  Inventory,
  PurchaseOrder,
  PurchaseOrderItem,
  IngredientConsumption
};