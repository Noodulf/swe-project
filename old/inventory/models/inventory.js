// models/Inventory.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Ingredient = require('./Ingredient');

const Inventory = sequelize.define('Inventory', {
  inventoryId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ingredientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: Ingredient,
      key: 'ingredientId'
    }
  },
  currentQuantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  thresholdValue: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 10
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inventory'
});

// Define associations
Inventory.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Ingredient.hasOne(Inventory, { foreignKey: 'ingredientId' });

module.exports = Inventory;
