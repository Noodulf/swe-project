// models/Supplier.js
const { sequelize, DataTypes } = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  supplierId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactInfo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'default address'  // Adding a default value for testing
  }
}, {
  tableName: 'suppliers',
  timestamps: true  // Explicitly enabling timestamps
});

// Add a hook to log the data before creation
Supplier.beforeCreate((supplier, options) => {
  console.log('Creating supplier with data:', supplier.toJSON());
});

module.exports = Supplier;