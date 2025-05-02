const Invoice = require('../models/invoice');
const PurchaseOrder = require('../models/purchaseOrder');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const cashBalanceController = require('./cashBalanceController');

// Generate a unique invoice number
const generateInvoiceNumber = async () => {
  try {
    console.log('Generating invoice number...');
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `INV-${year}${month}`;
    
    console.log('Looking for last invoice with prefix:', prefix);
    
    const lastInvoice = await Invoice.findOne({
      where: {
        invoice_number: {
          [Op.like]: `${prefix}%`
        }
      },
      order: [['invoice_number', 'DESC']]
    });

    console.log('Last invoice found:', lastInvoice);

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoice_number.split('-')[2]);
      sequence = lastSequence + 1;
    }

    const invoiceNumber = `${prefix}-${sequence.toString().padStart(4, '0')}`;
    console.log('Generated invoice number:', invoiceNumber);
    return invoiceNumber;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }
};

// Generate invoice from purchase order
exports.generateInvoice = async (req, res) => {
  const { purchaseOrderId } = req.body;
  console.log('Generating invoice for PO:', purchaseOrderId);

  try {
    const purchaseOrder = await PurchaseOrder.findByPk(purchaseOrderId);
    console.log('Found purchase order:', purchaseOrder);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    // Check if invoice already exists for this PO
    const existingInvoice = await Invoice.findOne({
      where: { purchase_order_id: purchaseOrderId }
    });
    console.log('Existing invoice check:', existingInvoice);

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice already exists for this purchase order'
      });
    }

    const invoiceNumber = await generateInvoiceNumber();
    const invoice = await Invoice.create({
      invoice_number: invoiceNumber,
      purchase_order_id: purchaseOrderId,
      amount: purchaseOrder.totalAmount,
      status: 'unpaid'
    });
    console.log('Created new invoice:', invoice);

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      invoice
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message
    });
  }
};

// Print cheque for an invoice
exports.printCheque = async (req, res) => {
  const { id } = req.params;
  console.log('Printing cheque for invoice:', id);

  try {
    const invoice = await Invoice.findByPk(id);
    console.log('Found invoice:', invoice);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is already paid'
      });
    }

    // Check if we have sufficient balance
    try {
      console.log('Checking balance for amount:', invoice.amount);
      const newBalance = await cashBalanceController.updateBalance(-invoice.amount);
      
      // Generate cheque number
      const chequeNumber = `CHQ-${Date.now().toString().slice(-6)}`;
      const chequeDate = new Date();

      console.log('Updating invoice with cheque details:', {
        chequeNumber,
        chequeDate
      });

      // Update invoice with cheque details
      await invoice.update({
        status: 'paid',
        cheque_number: chequeNumber,
        cheque_date: chequeDate
      });

      // --- Update inventory for each item in the related purchase order ---
      const purchaseOrder = await PurchaseOrder.findByPk(invoice.purchase_order_id, {
        include: [{ model: require('../models/PurchaseOrderItem') }]
      });
      if (purchaseOrder && purchaseOrder.PurchaseOrderItems) {
        for (const item of purchaseOrder.PurchaseOrderItems) {
          let inventoryItem = await require('../models/Inventory').findOne({
            where: { ingredientId: item.ingredientId }
          });
          if (!inventoryItem) {
            // Create new inventory record
            await require('../models/Inventory').create({
              ingredientId: item.ingredientId,
              currentQuantity: item.quantity,
              thresholdValue: 10, // Default threshold
              lastUpdated: new Date()
            });
          } else {
            // Update existing inventory record
            await inventoryItem.update({
              currentQuantity: inventoryItem.currentQuantity + item.quantity,
              lastUpdated: new Date()
            });
          }
        }
      }
      // --- End inventory update ---

      res.json({
        success: true,
        message: 'Cheque printed successfully and inventory updated',
        invoice,
        newBalance
      });
    } catch (error) {
      if (error.message === 'Insufficient funds') {
        return res.status(400).json({
          success: false,
          message: 'Insufficient funds to print cheque'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error printing cheque:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to print cheque',
      error: error.message
    });
  }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    console.log('Fetching all invoices...');
    const invoices = await Invoice.findAll({
      include: [{
        model: PurchaseOrder,
        attributes: ['purchaseOrderId', 'orderDate', 'status', 'totalAmount']
      }]
    });
    console.log('Found invoices:', invoices);

    res.json({
      success: true,
      invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  const { id } = req.params;
  console.log('Fetching invoice by ID:', id);

  try {
    const invoice = await Invoice.findByPk(id, {
      include: [{
        model: PurchaseOrder,
        attributes: ['purchaseOrderId', 'orderDate', 'status', 'totalAmount']
      }]
    });
    console.log('Found invoice:', invoice);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
}; 