const express = require('express');
const router = express.Router();
const {
  generateInvoice,
  printCheque,
  getAllInvoices,
  getInvoiceById
} = require('../controllers/invoiceController');

// Get all invoices
router.get('/', getAllInvoices);

// Get invoice by ID
router.get('/:id', getInvoiceById);

// Generate invoice from purchase order
router.post('/generate', generateInvoice);

// Print cheque for an invoice
router.post('/:id/print-cheque', printCheque);

module.exports = router; 