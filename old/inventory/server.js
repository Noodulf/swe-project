const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const { sequelize } = require('./models');

// Import routes
const inventoryRoutes = require('./routes/inventoryroutes');
const ingredientRoutes = require('./routes/ingredientroutes');
const supplierRoutes = require('./routes/supplierroutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderroutes');
const ingredientConsumptionRoutes = require('./routes/ingredientConsumptionRoutes');

// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

// Create Express app
const app = express();
sequelize.sync({ alter: true }) // alter: true will update the tables if they are not in sync with models
  .then(() => {
    console.log('Database synced');
  })
  .catch(err => {
    console.log('Error syncing database: ', err);
  });
// Configure middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // HTTP request logging

// Debug middleware for all routes
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
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
app.use('/api/inventory', inventoryRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/ingredient-consumption', ingredientConsumptionRoutes);
console.log('Routes registered');

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server only if not in test environment
const PORT = process.env.PORT || 3005;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }

};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; 