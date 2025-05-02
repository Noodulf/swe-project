const express = require('express');
const router = express.Router();
const Menu = require('../models/menu.js');
const roleCheck = require('../middleware/roleCheck');


router.get('/menu', async (req, res) => {
  // console.log('Received GET request for /menu');
  try {
    const menuItems = await Menu.findAll();  // Sequelize example
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch menu items' });
  }
})

router.post('/', roleCheck(['manager']), async (req, res) => {
  const { itemName, action, price } = req.body;

  try {
    if (action === 'add') {
      await Menu.create({
        menuItemName: itemName,
        price: price
      });
      return res.status(200).json({ message: 'Item added' });

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
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
