// models/IngredientConsumption.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Ingredient = require('./Ingredient');

const IngredientConsumption = sequelize.define('IngredientConsumption', {
  consumptionId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ingredientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ingredient,
      key: 'ingredientId'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'ingredient_consumption'
});

// Define associations
IngredientConsumption.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Ingredient.hasMany(IngredientConsumption, { foreignKey: 'ingredientId' });

module.exports = IngredientConsumption;