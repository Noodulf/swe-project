// controllers/purchaseOrderController.js
const PurchaseOrder = require('../models/PurchaseOrder');
const PurchaseOrderItem = require('../models/PurchaseOrderItem');
// const Supplier = require('../models/Supplier'); // Removed
const Ingredient = require('../models/Ingredient');
const Inventory = require('../models/Inventory');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const Invoice = require('../models/invoice');
const cashBalanceController = require('./cashBalanceController');

// Get all purchase orders with status (no supplier)
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.findAll({
      include: [
        {
          model: PurchaseOrderItem,
          include: [
            {
              model: Ingredient,
              attributes: ['name', 'unit']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // For each PO, do not include supplier
    const formattedOrders = purchaseOrders.map(order => ({
      id: order.purchaseOrderId,
      items: order.PurchaseOrderItems.map(item => ({
        ingredient: item.Ingredient ? item.Ingredient.name : 'Unknown',
        quantity: item.quantity
      })),
      status: order.status
    }));

    return res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase orders',
      error: error.message
    });
  }
};

// Get a single purchase order by ID
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        { model: PurchaseOrderItem, include: [{ model: Ingredient }] }
      ]
    });
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase order',
      error: error.message
    });
  }
};

// Create a new purchase order (no supplier)
exports.createPurchaseOrder = async (req, res) => {
  let transaction;
  
  try {
    console.log('Received purchase order request:', req.body);
    const { items, orders } = req.body;
    
    // Handle both request formats
    let orderItems = [];
    if (orders) {
      // Format from GeneratePO component
      console.log('Processing orders from GeneratePO:', orders);
      orderItems = orders.map(order => {
        if (!order.ingredient_id) {
          throw new Error(`Invalid ingredient ID in order: ${JSON.stringify(order)}`);
        }
        return {
          ingredientId: order.ingredient_id,
          quantity: order.quantity
        };
      });
    } else if (items) {
      // Format from InventoryManagement component
      console.log('Processing items from InventoryManagement:', items);
      orderItems = items;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No items or orders provided'
      });
    }

    if (!orderItems.length) {
      return res.status(400).json({
        success: false,
        message: 'No items to order'
      });
    }

    // Start transaction
    transaction = await sequelize.transaction();
    
    // Create purchase order with supplierId as null
    const purchaseOrder = await PurchaseOrder.create({
      supplierId: null,
      orderDate: new Date(),
      status: 'pending',
      totalAmount: 0
    }, { transaction });
    
    console.log('Created purchase order:', purchaseOrder.toJSON());
    
    let totalAmount = 0;
    
    // Create purchase order items
    for (const item of orderItems) {
      console.log('Processing item:', item);
      const ingredient = await Ingredient.findByPk(item.ingredientId, { transaction });
      if (!ingredient) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Ingredient with ID ${item.ingredientId} not found`
        });
      }
      
      console.log(`Found ingredient: ${ingredient.name} (ID: ${ingredient.ingredientId})`);
      const price = ingredient.pricePerUnit * item.quantity;
      totalAmount += price;
      
      const poItem = await PurchaseOrderItem.create({
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        price
      }, { transaction });
      
      console.log('Created purchase order item:', poItem.toJSON());
    }
    
    // Update total amount
    await purchaseOrder.update({ totalAmount }, { transaction });
    
    await transaction.commit();
    
    // Fetch the complete purchase order with items
    const completePurchaseOrder = await PurchaseOrder.findByPk(purchaseOrder.purchaseOrderId, {
      include: [
        { 
          model: PurchaseOrderItem,
          include: [{ 
            model: Ingredient,
            attributes: ['name', 'unit']
          }]
        }
      ]
    });
    
    console.log('Complete purchase order:', completePurchaseOrder.toJSON());
    
    // Format the response (no supplier)
    const formattedOrder = {
      id: completePurchaseOrder.purchaseOrderId,
      items: completePurchaseOrder.PurchaseOrderItems.map(item => ({
        ingredient: item.Ingredient ? item.Ingredient.name : 'Unknown',
        quantity: item.quantity
      })),
      status: completePurchaseOrder.status
    };
    
    return res.status(201).json({
      success: true,
      data: formattedOrder
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error creating purchase order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create purchase order',
      error: error.message
    });
  }
};

// Update purchase order status
exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'sent', 'received', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, sent, received, cancelled)'
      });
    }
    
    const purchaseOrder = await PurchaseOrder.findByPk(id);
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    // Special handling for "received" status - update inventory
    if (status === 'received' && purchaseOrder.status !== 'received') {
      await handleReceivedPurchaseOrder(id);
    }
    
    await purchaseOrder.update({ status });
    
    return res.status(200).json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update purchase order status',
      error: error.message
    });
  }
};

// Helper function to handle received purchase orders
async function handleReceivedPurchaseOrder(purchaseOrderId) {
  const transaction = await sequelize.transaction();
  
  try {
    // Fetch the purchase order details with items
    const purchaseOrder = await PurchaseOrder.findByPk(purchaseOrderId, {
      include: [
        { model: PurchaseOrderItem, include: [{ model: Ingredient }] }
      ],
      transaction
    });
    
    if (!purchaseOrder) {
      throw new Error(`Purchase order with ID ${purchaseOrderId} not found`);
    }
    
    if (purchaseOrder.status === 'received') {
      throw new Error(`Purchase order ${purchaseOrderId} has already been received`);
    }
    
    // Update inventory for each item in the purchase order
    for (const item of purchaseOrder.PurchaseOrderItems) {
      // Get current inventory record
      const inventoryItem = await Inventory.findOne({
        where: { ingredientId: item.ingredientId },
        transaction
      });
      
      if (!inventoryItem) {
        // Create new inventory record if it doesn't exist
        await Inventory.create({
          ingredientId: item.ingredientId,
          currentQuantity: item.quantity,
          thresholdValue: 10, // Default threshold
          lastUpdated: new Date()
        }, { transaction });
      } else {
        // Update existing inventory record
        await inventoryItem.update({
          currentQuantity: inventoryItem.currentQuantity + item.quantity,
          lastUpdated: new Date()
        }, { transaction });
      }
    }
    
    // Update purchase order status
    await purchaseOrder.update({
      status: 'received',
      receivedDate: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    return purchaseOrder;
  } catch (error) {
    await transaction.rollback();
    console.error('Error receiving purchase order:', error);
    throw error;
  }
}

// Get purchase order history (no supplier logic)
exports.getPurchaseOrderHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.orderDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    const purchaseOrders = await PurchaseOrder.findAll({
      where,
      include: [
        { model: PurchaseOrderItem, include: [{ model: Ingredient }] }
      ],
      order: [['orderDate', 'DESC']]
    });
    return res.status(200).json({
      success: true,
      data: purchaseOrders
    });
  } catch (error) {
    console.error('Error fetching purchase order history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase order history',
      error: error.message
    });
  }
};

// Approve a purchase order (no supplier logic)
exports.approvePurchaseOrder = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    console.log('Approving purchase order:', id);
    transaction = await sequelize.transaction();
    const purchaseOrder = await PurchaseOrder.findByPk(id, { transaction });
    if (!purchaseOrder) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    if (purchaseOrder.status === 'approved') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Purchase order is already approved' });
    }
    // Update status to approved
    await purchaseOrder.update({ status: 'approved', approvedDate: new Date() }, { transaction });
    console.log('PO approved, now checking for invoice...');
    // --- AUTO-GENERATE AND PAY INVOICE ---
    let invoice = await Invoice.findOne({ where: { purchase_order_id: id }, transaction });
    if (!invoice) {
      console.log('No invoice found, generating new invoice...');
      // Generate invoice number
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const prefix = `INV-${year}${month}`;
      const lastInvoice = await Invoice.findOne({
        where: { invoice_number: { [Op.like]: `${prefix}%` } },
        order: [['invoice_number', 'DESC']],
        transaction
      });
      let sequence = 1;
      if (lastInvoice) {
        const lastSequence = parseInt(lastInvoice.invoice_number.split('-')[2]);
        sequence = lastSequence + 1;
      }
      const invoiceNumber = `${prefix}-${sequence.toString().padStart(4, '0')}`;
      invoice = await Invoice.create({
        invoice_number: invoiceNumber,
        purchase_order_id: id,
        amount: purchaseOrder.totalAmount,
        status: 'unpaid'
      }, { transaction });
      console.log('Invoice created:', invoice.invoice_number, 'Amount:', invoice.amount);
    } else {
      console.log('Invoice already exists:', invoice.invoice_number);
    }
    // Mark invoice as paid and deduct cash balance
    console.log('Deducting cash balance for invoice amount:', invoice.amount);
    const newBalance = await cashBalanceController.updateBalance(-invoice.amount);
    const chequeNumber = `CHQ-${Date.now().toString().slice(-6)}`;
    const chequeDate = new Date();
    await invoice.update({
      status: 'paid',
      cheque_number: chequeNumber,
      cheque_date: chequeDate
    }, { transaction });
    console.log('Invoice marked as paid. Cheque:', chequeNumber, 'Date:', chequeDate);

    // --- Update inventory for each item in the purchase order ---
    try {
      console.log('Starting inventory update for PO items...');
      const poItems = await PurchaseOrderItem.findAll({ 
        where: { purchaseOrderId: purchaseOrder.purchaseOrderId },
        include: [{ model: Ingredient }], // Include ingredient details
        transaction 
      });
      
      console.log(`Found ${poItems.length} items to update in inventory`);
      
      if (poItems.length === 0) {
        console.log('Warning: No items found in purchase order to update inventory');
      }
      
      for (const item of poItems) {
        try {
          if (!item.Ingredient) {
            console.error(`Error: Ingredient not found for item ${item.purchaseOrderItemId}`);
            continue;
          }
          
          console.log(`Processing inventory update for ingredient: ${item.Ingredient.name}, quantity: ${item.quantity}`);
          let inventoryItem = await Inventory.findOne({ 
            where: { ingredientId: item.ingredientId },
            transaction 
          });
          
          if (!inventoryItem) {
            console.log(`Creating new inventory record for ${item.Ingredient.name}`);
            const newInventory = await Inventory.create({
              ingredientId: item.ingredientId,
              currentQuantity: item.quantity,
              thresholdValue: 10, // Default threshold
              lastUpdated: new Date()
            }, { transaction });
            console.log(`Created new inventory record for ${item.Ingredient.name} with quantity ${item.quantity}`);
          } else {
            const oldQuantity = inventoryItem.currentQuantity;
            const newQuantity = oldQuantity + item.quantity;
            console.log(`Updating inventory for ${item.Ingredient.name}: ${oldQuantity} + ${item.quantity} = ${newQuantity}`);
            await inventoryItem.update({
              currentQuantity: newQuantity,
              lastUpdated: new Date()
            }, { transaction });
            console.log(`Updated inventory for ${item.Ingredient.name} to ${newQuantity}`);
          }
        } catch (itemError) {
          console.error(`Error updating inventory for item ${item.purchaseOrderItemId}:`, itemError);
          // Continue with other items even if one fails
        }
      }
      console.log('Inventory update completed successfully');
    } catch (inventoryError) {
      console.error('Error during inventory update:', inventoryError);
      throw inventoryError; // Re-throw to be caught by outer try-catch
    }
    // --- End inventory update ---

    await transaction.commit();
    console.log('Transaction committed. PO approved, invoice generated and paid, inventory updated.');
    return res.status(200).json({
      success: true,
      data: {
        id: purchaseOrder.purchaseOrderId,
        status: 'approved',
        invoice_number: invoice.invoice_number,
        invoice_status: 'paid',
        cheque_number: chequeNumber,
        cheque_date: chequeDate,
        newBalance
      },
      message: 'Purchase order approved, invoice generated and paid.'
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error approving purchase order:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve purchase order', error: error.message });
  }
};

// Check all inventory items and generate purchase orders if needed (no supplier logic)
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

    // Create a single purchase order for all low stock items
    const po = await PurchaseOrder.create({
      orderDate: new Date(),
      status: 'pending',
      totalAmount: 0
    }, { transaction });

    let totalAmount = 0;
    for (const item of lowInventoryItems) {
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
    await po.update({ totalAmount }, { transaction });

    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: 'Purchase order generated successfully',
      data: po
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

// Create a new supply request (from SupplyRequest page)
exports.createSupplyRequest = async (req, res) => {
  let transaction;
  try {
    const { requests } = req.body;
    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ success: false, message: 'No requests provided' });
    }

    transaction = await sequelize.transaction();

    // Create purchase order
    const purchaseOrder = await PurchaseOrder.create({
      supplierId: null,
      orderDate: new Date(),
      status: 'pending',
      totalAmount: 0
    }, { transaction });

    let totalAmount = 0;

    for (const reqItem of requests) {
      let ingredient;
      if (reqItem.ingredientId) {
        ingredient = await Ingredient.findByPk(reqItem.ingredientId, { transaction });
        if (!ingredient) {
          await transaction.rollback();
          return res.status(404).json({ success: false, message: `Ingredient ID ${reqItem.ingredientId} not found` });
        }
      } else if (reqItem.name && reqItem.unit && reqItem.pricePerUnit) {
        // Create new ingredient
        ingredient = await Ingredient.create({
          name: reqItem.name,
          unit: reqItem.unit,
          pricePerUnit: reqItem.pricePerUnit
        }, { transaction });
      } else {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Missing ingredient details for new ingredient' });
      }
      const price = ingredient.pricePerUnit ? ingredient.pricePerUnit * reqItem.quantity : 0;
      totalAmount += price;
      await PurchaseOrderItem.create({
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        ingredientId: ingredient.ingredientId,
        quantity: reqItem.quantity,
        price
      }, { transaction });
    }

    await purchaseOrder.update({ totalAmount }, { transaction });
    await transaction.commit();
    return res.status(201).json({ success: true, message: 'Supply request created as purchase order', purchaseOrderId: purchaseOrder.purchaseOrderId });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Error creating supply request:', error);
    return res.status(500).json({ success: false, message: 'Failed to create supply request', error: error.message });
  }
};

// Debug endpoint to check PO items and inventory
exports.debugPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Debugging purchase order:', id);
    
    // Get purchase order with items
    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        { 
          model: PurchaseOrderItem,
          include: [{ model: Ingredient }]
        }
      ]
    });
    
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    
    // Get current inventory status for each item
    const inventoryStatus = await Promise.all(
      purchaseOrder.PurchaseOrderItems.map(async (item) => {
        const inventory = await Inventory.findOne({
          where: { ingredientId: item.ingredientId }
        });
        return {
          ingredientId: item.ingredientId,
          ingredientName: item.Ingredient.name,
          poQuantity: item.quantity,
          currentInventory: inventory ? inventory.currentQuantity : 0
        };
      })
    );
    
    return res.status(200).json({
      success: true,
      data: {
        purchaseOrder: {
          id: purchaseOrder.purchaseOrderId,
          status: purchaseOrder.status,
          items: purchaseOrder.PurchaseOrderItems.map(item => ({
            ingredientId: item.ingredientId,
            ingredientName: item.Ingredient.name,
            quantity: item.quantity
          }))
        },
        inventoryStatus
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return res.status(500).json({ success: false, message: 'Debug failed', error: error.message });
  }
};