// controllers/inventoryController.js
const Inventory = require('../models/Inventory');
const Ingredient = require('../models/Ingredient');
const IngredientConsumption = require('../models/IngredientConsumption');
const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseOrderItem = require('../models/PurchaseOrderItem');
const Supplier = require('../models/Supplier');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all inventory items
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [{ model: Ingredient }]
    });
    
    return res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

// Get a single inventory item by ID
exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inventoryItem = await Inventory.findByPk(id, {
      include: [{ model: Ingredient }]
    });
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory item',
      error: error.message
    });
  }
};

// Update inventory stock
exports.updateStock = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ingredientId, quantity } = req.body;
    
    if (!ingredientId || quantity === undefined) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Ingredient ID and quantity are required'
      });
    }
    
    // Find the inventory item
    let inventoryItem = await Inventory.findOne({
      where: { ingredientId },
      include: [{ model: Ingredient }],
      transaction
    });
    
    if (!inventoryItem) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Update the quantity
    const newQuantity = inventoryItem.currentQuantity + parseFloat(quantity);
    
    if (newQuantity < 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot reduce stock below zero'
      });
    }
    
    // Update inventory
    await inventoryItem.update({ currentQuantity: newQuantity }, { transaction });
    
    // If this is consumption (negative quantity), log it
    if (quantity < 0) {
      await IngredientConsumption.create({
        ingredientId,
        quantity: Math.abs(quantity),
        date: new Date()
      }, { transaction });
    }
    
    // Check if threshold is reached and we need to generate purchase order
    const needsReordering = newQuantity <= inventoryItem.thresholdValue;
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      data: inventoryItem,
      needsReordering
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating inventory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inventory',
      error: error.message
    });
  }
};

// Calculate threshold value for an ingredient
exports.calculateThreshold = async (req, res) => {
  try {
    const { ingredientId } = req.params;
    
    // Get consumption data for the past 3 days
    const threeDbaysAgo = new Date();
    threeDbaysAgo.setDate(threeDbaysAgo.getDate() - 3);
    
    const consumption = await IngredientConsumption.findAll({
      where: {
        ingredientId,
        date: {
          [Op.gte]: threeDbaysAgo
        }
      }
    });
    
    // Calculate average daily consumption
    let totalConsumption = 0;
    consumption.forEach(item => {
      totalConsumption += item.quantity;
    });
    
    const avgDailyConsumption = totalConsumption / 3;
    
    // Calculate threshold value (average daily consumption * 2)
    const thresholdValue = avgDailyConsumption * 2;
    
    // Update the inventory item with the new threshold
    const inventoryItem = await Inventory.findOne({
      where: { ingredientId }
    });
    
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    await inventoryItem.update({ thresholdValue });
    
    return res.status(200).json({
      success: true,
      data: {
        inventoryItem,
        avgDailyConsumption,
        thresholdValue
      }
    });
  } catch (error) {
    console.error('Error calculating threshold:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate threshold',
      error: error.message
    });
  }
};

// Check all inventory items and generate purchase orders if needed
exports.checkInventoryLevels = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Get all inventory items that are below threshold
    const lowInventoryItems = await Inventory.findAll({
      where: {
        currentQuantity: {
          [Op.lte]: sequelize.col('thresholdValue')
        }
      },
      include: [{ model: Ingredient }],
      transaction
    });
    
    if (lowInventoryItems.length === 0) {
      await transaction.commit();
      return res.status(200).json({
        success: true,
        message: 'No items need reordering',
        data: []
      });
    }
    
    // Group items by supplier (simplified - assuming one supplier per ingredient)
    const groupedBySupplier = {};
    
    // Get default supplier (in a real system, you'd have suppliers linked to ingredients)
    const defaultSupplier = await Supplier.findOne({ transaction });
    
    if (!defaultSupplier) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No suppliers found in the system'
      });
    }
    
    // Group items
    lowInventoryItems.forEach(item => {
      if (!groupedBySupplier[defaultSupplier.supplierId]) {
        groupedBySupplier[defaultSupplier.supplierId] = [];
      }
      groupedBySupplier[defaultSupplier.supplierId].push(item);
    });
    
    // Create purchase orders
    const purchaseOrders = [];
    
    for (const supplierId in groupedBySupplier) {
      // Create purchase order
      const po = await PurchaseOrder.create({
        supplierId,
        orderDate: new Date(),
        status: 'pending',
        totalAmount: 0 // Will calculate below
      }, { transaction });
      
      let totalAmount = 0;
      
      // Add items to purchase order
      for (const item of groupedBySupplier[supplierId]) {
        // Calculate quantity to order (2 days supply based on threshold)
        const orderQuantity = item.thresholdValue - item.currentQuantity + (item.thresholdValue / 2);
        const price = item.Ingredient.pricePerUnit * orderQuantity;
        
        await PurchaseOrderItem.create({
          purchaseOrderId: po.purchaseOrderId,
          ingredientId: item.ingredientId,
          quantity: orderQuantity,
          price
        }, { transaction });
        
        totalAmount += price;
      }
      
      // Update total amount
      await po.update({ totalAmount }, { transaction });
      purchaseOrders.push(po);
    }
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Purchase orders generated successfully',
      data: purchaseOrders
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error checking inventory levels:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check inventory levels',
      error: error.message
    });
  }
};