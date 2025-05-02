const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Ingredient = require('./Ingredient');
const Supplier = require('./Supplier');

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
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Supplier,
      key: 'supplierId'
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
      fields: ['ingredientId', 'supplierId']
    }
  ]
});

// Define associations
IngredientSupplier.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
IngredientSupplier.belongsTo(Supplier, { foreignKey: 'supplierId' });
Ingredient.belongsToMany(Supplier, { through: IngredientSupplier, foreignKey: 'ingredientId' });
Supplier.belongsToMany(Ingredient, { through: IngredientSupplier, foreignKey: 'supplierId' });

module.exports = IngredientSupplier; 