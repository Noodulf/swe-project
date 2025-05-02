// controllers/ingredientController.js
const Ingredient = require('../models/Ingredient');
const Inventory = require('../models/Inventory');
const sequelize = require('../config/database');

// Get all ingredients
exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll();
    return res.status(200).json({
      success: true,
      data: ingredients
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch ingredients',
      error: error.message
    });
  }
};

// Get a single ingredient by ID
exports.getIngredientById = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findByPk(id);
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch ingredient',
      error: error.message
    });
  }
};

// Create a new ingredient
exports.createIngredient = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, unit, pricePerUnit, initialQuantity = 0, thresholdValue = 10 } = req.body;
    
    // Validate input
    if (!name || !unit || !pricePerUnit) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Name, unit, and price per unit are required'
      });
    }
    
    // Create the ingredient
    const ingredient = await Ingredient.create({
      name,
      unit,
      pricePerUnit
    }, { transaction });
    
    // Create corresponding inventory entry
    await Inventory.create({
      ingredientId: ingredient.ingredientId,
      currentQuantity: initialQuantity,
      thresholdValue
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(201).json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating ingredient:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create ingredient',
      error: error.message
    });
  }
};

// Update an ingredient
exports.updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, pricePerUnit } = req.body;
    
    const ingredient = await Ingredient.findByPk(id);
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }
    
    await ingredient.update({
      name: name || ingredient.name,
      unit: unit || ingredient.unit,
      pricePerUnit: pricePerUnit || ingredient.pricePerUnit
    });
    
    return res.status(200).json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update ingredient',
      error: error.message
    });
  }
};

// Delete an ingredient
exports.deleteIngredient = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const ingredient = await Ingredient.findByPk(id, { transaction });
    
    if (!ingredient) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }
    
    // Delete associated inventory entry
    await Inventory.destroy({
      where: { ingredientId: id },
      transaction
    });
    
    // Delete the ingredient
    await ingredient.destroy({ transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Ingredient deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting ingredient:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete ingredient',
      error: error.message
    });
  }
};