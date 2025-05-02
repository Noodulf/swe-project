const { sequelize } = require('./models');
const Invoice = require('./models/invoice');
const CashBalance = require('./models/cashBalance');
const PurchaseOrder = require('./models/PurchaseOrder');
const Ingredient = require('./models/Ingredient');
const Inventory = require('./models/Inventory');

async function syncDatabase() {
  try {
    console.log('Starting database sync...');
    
    // Force sync the Invoice model
    console.log('Syncing Invoice model...');
    await Invoice.sync({ force: true });
    console.log('Invoice table created successfully');

    // Force sync the CashBalance model
    console.log('Syncing CashBalance model...');
    await CashBalance.sync({ force: true });
    console.log('CashBalance table created successfully');
    
    await Ingredient.sync({ force: true });
    await Inventory.sync({ force: true });
    Inventory.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
    Ingredient.hasOne(Inventory, { foreignKey: 'ingredientId' });


    // Create initial cash balance for current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    console.log('Creating initial cash balance...');
    await CashBalance.create({
      month: firstDayOfMonth,
      balance: 100000.00,
      last_updated: new Date()
    });
    console.log('Initial cash balance created successfully');

    console.log('Database sync completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during database sync:', error);
    process.exit(1);
  }
}

// Run the sync
console.log('Starting database synchronization...');
syncDatabase(); 