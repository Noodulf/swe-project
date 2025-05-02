const express = require('express');
const router = express.Router();
const { currentOrders } = require('../memoryStore');
const Bill = require('../models/Bill');
const roleCheck = require('../middleware/roleCheck');

// Finalize bill
router.post('/', roleCheck(['sales-clerk', 'manager']), async (req, res) => {
  const { tempId } = req.body;
  const order = currentOrders[tempId];
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const totalAmount = order.items.reduce((sum, item) => sum + item.total, 0);

  const newBill = await Bill.create({
    customerName: order.customerName,
    items: order.items,
    totalAmount
  });

  delete currentOrders[tempId];  // Delete order after billing

  res.json({ message: 'Bill generated', bill: newBill });
});

module.exports = router;
