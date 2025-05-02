// controllers/inventoryController.js
const Ingredient = require('../models/Ingredient');
const Inventory = require('../models/Inventory');
const IngredientConsumption = require('../models/IngredientConsumption');
const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseOrderItem = require('../models/PurchaseOrderItem');
const Supplier = require('../models/Supplier');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all inventory items with status and stock level
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [{ 
        model: Ingredient,
        attributes: ['ingredientId', 'name', 'unit']
      }]
    });
    
    // Add status, stock level, and threshold value information
    const inventoryWithStatus = inventory.map(item => ({
      id: item.inventoryId,
      Ingredient: {
        name: item.Ingredient.name,
        unit: item.Ingredient.unit
      },
      stockLevel: item.currentQuantity,
      thresholdValue: item.thresholdValue,
      status: item.currentQuantity <= item.thresholdValue ? 'Low Stock' : 'In Stock',
      needsReorder: item.currentQuantity <= item.thresholdValue
    }));
    
    return res.status(200).json({
      success: true,
      data: inventoryWithStatus
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

// Get chef inventory view (simplified view with only essential information)
exports.getChefInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [{ 
        model: Ingredient,
        attributes: ['name', 'unit']
      }],
      attributes: ['currentQuantity']
    });
    
    const chefInventory = inventory.map(item => ({
      ingredient: item.Ingredient.name,
      quantity: item.currentQuantity,
      unit: item.Ingredient.unit
    }));
    
    return res.status(200).json({
      success: true,
      data: chefInventory
    });
  } catch (error) {
    console.error('Error fetching chef inventory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chef inventory',
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

// Record ingredient consumption when preparing food items
exports.recordIngredientConsumption = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ingredientId, quantity, recipeId } = req.body;
    
    if (!ingredientId || !quantity || quantity <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Valid ingredient ID and quantity are required'
      });
    }
    
    // Find the inventory item
    const inventoryItem = await Inventory.findOne({
      where: { ingredientId },
      transaction
    });
    
    if (!inventoryItem) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Check if enough stock is available
    if (inventoryItem.currentQuantity < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }
    
    // Update inventory
    await inventoryItem.update({
      currentQuantity: inventoryItem.currentQuantity - quantity
    }, { transaction });
    
    // Record consumption
    await IngredientConsumption.create({
      ingredientId,
      quantity,
      recipeId,
      date: new Date()
    }, { transaction });
    
    // Check if threshold is reached
    const needsReordering = inventoryItem.currentQuantity <= inventoryItem.thresholdValue;
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Ingredient consumption recorded successfully',
      data: {
        currentQuantity: inventoryItem.currentQuantity,
        needsReordering
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error recording ingredient consumption:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record ingredient consumption',
      error: error.message
    });
  }
};

// Update inventory when ordered ingredients arrive
exports.updateInventoryOnDelivery = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { purchaseOrderId, items } = req.body;
    
    if (!purchaseOrderId || !items || !Array.isArray(items)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Purchase order ID and items array are required'
      });
    }
    
    // Verify purchase order exists and is pending
    const purchaseOrder = await PurchaseOrder.findOne({
      where: {
        purchaseOrderId,
        status: 'pending'
      },
      transaction
    });
    
    if (!purchaseOrder) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Pending purchase order not found'
      });
    }
    
    // Update inventory for each item
    for (const item of items) {
      const { ingredientId, quantity, price } = item;
      
      // Find or create inventory item
      let inventoryItem = await Inventory.findOne({
        where: { ingredientId },
        transaction
      });
      
      if (!inventoryItem) {
        inventoryItem = await Inventory.create({
          ingredientId,
          currentQuantity: 0,
          thresholdValue: 10, // Default threshold
          lastUpdated: new Date()
        }, { transaction });
      }
      
      // Update inventory
      await inventoryItem.update({
        currentQuantity: inventoryItem.currentQuantity + quantity,
        lastUpdated: new Date()
      }, { transaction });
      
      // Update purchase order item
      await PurchaseOrderItem.update({
        receivedQuantity: quantity,
        receivedPrice: price,
        receivedDate: new Date()
      }, {
        where: {
          purchaseOrderId,
          ingredientId
        },
        transaction
      });
    }
    
    // Update purchase order status
    await purchaseOrder.update({
      status: 'received',
      receivedDate: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Inventory updated successfully for delivery'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating inventory on delivery:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inventory on delivery',
      error: error.message
    });
  }
};

// Calculate and update threshold values for all ingredients
exports.calculateThresholds = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Get all ingredients
    const ingredients = await Ingredient.findAll({
      include: [{ model: Inventory }],
      transaction
    });
    
    const results = [];
    
    for (const ingredient of ingredients) {
      // Get consumption data for the past 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const consumption = await IngredientConsumption.findAll({
        where: {
          ingredientId: ingredient.ingredientId,
          date: {
            [Op.gte]: threeDaysAgo
          }
        },
        transaction
      });
      
      // Calculate average daily consumption
      let totalConsumption = 0;
      consumption.forEach(item => {
        totalConsumption += item.quantity;
      });
      
      const avgDailyConsumption = totalConsumption / 3;
      
      // Calculate threshold value (average daily consumption * 2)
      const thresholdValue = avgDailyConsumption * 2;
      
      // Update inventory item
      if (ingredient.Inventory) {
        await ingredient.Inventory.update({
          thresholdValue
        }, { transaction });
      } else {
        await Inventory.create({
          ingredientId: ingredient.ingredientId,
          currentQuantity: 0,
          thresholdValue,
          lastUpdated: new Date()
        }, { transaction });
      }
      
      results.push({
        ingredientId: ingredient.ingredientId,
        name: ingredient.name,
        avgDailyConsumption,
        thresholdValue
      });
    }
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Threshold values calculated and updated successfully',
      data: results
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error calculating thresholds:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate thresholds',
      error: error.message
    });
  }
};