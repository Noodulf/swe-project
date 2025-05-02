const { sequelize } = require('./config/database');
const { 
  Supplier,
  Ingredient,
  Inventory,
  PurchaseOrder,
  PurchaseOrderItem,
  IngredientConsumption
} = require('./models');

async function syncDatabase() {
  try {
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase(); 