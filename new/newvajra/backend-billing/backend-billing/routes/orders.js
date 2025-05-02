const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { currentOrders, itemsList } = require('../memoryStore');
const Menu = require('../models/menu.js');

// Create new order
router.post('/', (req, res) => {
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
router.post('/:tempId/items', async (req, res) => {
  const { tempId } = req.params;
  const { itemId, quantity } = req.body;  // Using itemId to identify item

  const order = currentOrders[tempId];
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Fetch item from the Menu table
  const item = await Menu.findOne({ where: { menuItemName: itemId } });
  if (!item) return res.status(404).json({ message: 'Item not found' });

  const total = item.price * quantity;

  // Add item to the order
  order.items.push({
    name: item.menuItemName,
    quantity,
    unitPrice: item.price,
    total
  });

  res.json({ message: 'Item added', order });
});

router.get('/:tempId', (req, res) => {
  const { tempId } = req.params;
  const order = currentOrders[tempId];
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

module.exports = router;
