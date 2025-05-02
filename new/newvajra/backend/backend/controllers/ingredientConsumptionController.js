const { IngredientConsumption, Ingredient, Inventory } = require('../models');
const winston = require('winston');

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

// Create a new consumption record
const createConsumption = async (req, res) => {
  const transaction = await IngredientConsumption.sequelize.transaction();
  
  try {
    const { ingredientId, quantity } = req.body;
    
    // Validate input
    if (!ingredientId || !quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ingredientId and quantity'
      });
    }
    
    // Create consumption record
    const consumption = await IngredientConsumption.create({
      ingredientId,
      quantity,
      date: new Date()
    }, { transaction });
    
    // Update inventory
    const inventory = await Inventory.findOne({
      where: { ingredientId }
    }, { transaction });
    
    if (!inventory) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found'
      });
    }
    
    // Update current quantity and last updated time
    await inventory.update({
      currentQuantity: inventory.currentQuantity - quantity,
      lastUpdated: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    logger.info(`Created consumption record for ingredient ${ingredientId}`);
    res.status(201).json({
      success: true,
      data: consumption
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating consumption record:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating consumption record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all consumption records
const getAllConsumptions = async (req, res) => {
  try {
    const consumptions = await IngredientConsumption.findAll({
      include: [{
        model: Ingredient,
        attributes: ['name', 'unit']
      }],
      order: [['date', 'DESC']]
    });
    
    logger.info('Retrieved all consumption records');
    res.json({
      success: true,
      data: consumptions
    });
  } catch (error) {
    logger.error('Error retrieving consumption records:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving consumption records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a specific consumption record
const getConsumptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const consumption = await IngredientConsumption.findByPk(id, {
      include: [{
        model: Ingredient,
        attributes: ['name', 'unit']
      }]
    });
    
    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'Consumption record not found'
      });
    }
    
    logger.info(`Retrieved consumption record ${id}`);
    res.json({
      success: true,
      data: consumption
    });
  } catch (error) {
    logger.error('Error retrieving consumption record:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving consumption record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all consumption records for a specific ingredient
const getConsumptionsByIngredient = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const consumptions = await IngredientConsumption.findAll({
      where: { ingredientId },
      include: [{
        model: Ingredient,
        attributes: ['name', 'unit']
      }],
      order: [['date', 'DESC']]
    });
    
    logger.info(`Retrieved consumption records for ingredient ${ingredientId}`);
    res.json({
      success: true,
      data: consumptions
    });
  } catch (error) {
    logger.error('Error retrieving consumption records:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving consumption records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createConsumption,
  getAllConsumptions,
  getConsumptionById,
  getConsumptionsByIngredient
}; 