const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Menu = sequelize.define('Menu', {
  menuItemName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'menu', // optional: force table name to lowercase
  timestamps: false  // if you don't want createdAt and updatedAt
});

module.exports = Menu;
