const express = require('express');
const router = express.Router();
const Menu = require('../models/menu.js');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await Menu.findAll();
    res.json(menuItems);
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add or delete menu item
router.post('/', async (req, res) => {
  const { itemName, action, price } = req.body;

  try {
    if (!itemName || !price) {
      return res.status(400).json({ message: 'Item name and price are required' });
    }

    if (action === 'add') {
      // Check if item already exists
      const existingItem = await Menu.findOne({
        where: { menuItemName: itemName }
      });

      if (existingItem) {
        return res.status(400).json({ message: 'Item already exists' });
      }

      const newItem = await Menu.create({
        menuItemName: itemName,
        price: price
      });
      return res.status(200).json({ message: 'Item added', item: newItem });

    } else if (action === 'delete') {
      const deletedCount = await Menu.destroy({
        where: {
          menuItemName: itemName,
          price: price
        }
      });

      if (deletedCount === 0) {
        return res.status(404).json({ message: 'Item not found to delete' });
      }

      return res.status(200).json({ message: 'Item deleted' });

    } else {
      return res.status(400).json({ message: 'Invalid action. Use "add" or "delete".' });
    }
  } catch (err) {
    console.error('Error in menu operation:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      details: err.errors ? err.errors.map(e => e.message) : null
    });
  }
});

module.exports = router;
