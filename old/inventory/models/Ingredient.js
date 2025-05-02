// models/Ingredient.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ingredient = sequelize.define('Ingredient', {
  ingredientId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pricePerUnit: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'ingredients'
});

module.exports = Ingredient;