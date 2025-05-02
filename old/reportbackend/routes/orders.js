const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { currentOrders, itemsList } = require('../memoryStore');
const roleCheck = require('../middleware/roleCheck');

// Create new order
router.post('/', roleCheck(['sales-clerk', 'manager']), (req, res) => {
  const { customerName } = req.body;
  const tempId = uuidv4();
  currentOrders[tempId] = {
    customerName,
    items: [],
    createdAt: new Date()
  };
  res.json({ tempId });
});

// Add item to order
router.post('/:tempId/items', roleCheck(['sales-clerk', 'manager']), (req, res) => {
  const { tempId } = req.params;
  const { itemId, quantity } = req.body;  // Using itemId to identify item

  const order = currentOrders[tempId];
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const item = itemsList[itemId];  // Fetch item from predefined items list
  if (!item) return res.status(404).json({ message: 'Item not found' });

  const total = item.unitPrice * quantity;

  // Add item to the order
  order.items.push({
    name: item.name,
    quantity,
    unitPrice: item.unitPrice,
    total
  });

  res.json({ message: 'Item added', order });
});

module.exports = router;
