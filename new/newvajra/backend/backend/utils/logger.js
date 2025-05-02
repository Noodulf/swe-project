// utils/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    })
  ]
});

// If we're not in production, log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Helper functions for different log types
const logInventoryUpdate = (ingredientId, quantity, newQuantity) => {
  logger.info('Inventory update', {
    type: 'INVENTORY_UPDATE',
    ingredientId,
    quantity,
    newQuantity,
    timestamp: new Date()
  });
};

const logPurchaseOrder = (purchaseOrderId, status, items) => {
  logger.info('Purchase order update', {
    type: 'PURCHASE_ORDER',
    purchaseOrderId,
    status,
    items,
    timestamp: new Date()
  });
};

const logError = (error, context) => {
  logger.error('Error occurred', {
    type: 'ERROR',
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date()
  });
};

module.exports = {
  logger,
  logInventoryUpdate,
  logPurchaseOrder,
  logError
}; 