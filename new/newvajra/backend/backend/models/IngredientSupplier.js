const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Ingredient = require('./Ingredient');

const IngredientSupplier = sequelize.define('IngredientSupplier', {
  ingredientSupplierId: {
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
  isPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  pricePerUnit: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'ingredient_suppliers',
  indexes: [
    {
      unique: true,
      fields: ['ingredientId']
    }
  ]
});

IngredientSupplier.belongsTo(Ingredient, { foreignKey: 'ingredientId' });

module.exports = IngredientSupplier; 