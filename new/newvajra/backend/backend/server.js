const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const { sequelize } = require('./models');



// Import routes
const ingredientRoutes = require('./routes/ingredientroutes');
const inventoryRoutes = require('./routes/inventoryroutes');
// const supplierRoutes = require('./routes/supplierroutes'); // Removed
const purchaseOrderRoutes = require('./routes/purchaseOrderroutes');
const ingredientConsumptionRoutes = require('./routes/ingredientConsumptionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const cashBalanceRoutes = require('./routes/cashBalanceRoutes');

// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

// Create Express app
const app = express();

// Configure middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // HTTP request logging

// Debug middleware for all routes
app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers
  });
  next();
});

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Use routes
console.log('Registering routes...');
app.use('/api/ingredients', ingredientRoutes);  
app.use('/api/inventory', inventoryRoutes);
// app.use('/api/suppliers', supplierRoutes); // Removed
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/ingredient-consumption', ingredientConsumptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/cash-balance', cashBalanceRoutes);
console.log('Routes registered');

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});


sequelize.sync({ alter: true }) // alter: true will update the tables if they are not in sync with models
  .then(() => {
    console.log('Database synced');
  })
  .catch(err => {
    console.log('Error syncing database: ', err);
  });


// Start server only if not in test environment
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    console.log('Database connection has been established successfully.');
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`Server is running on port ${PORT}`);
      console.log('Available routes:');
      console.log('- GET /api/test');
      console.log('- GET /api/invoices');
      console.log('- GET /api/cash-balance');
      console.log('- GET /api/purchase-orders');
      console.log('- GET /api/inventory');
      console.log('- GET /api/ingredients');
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; 