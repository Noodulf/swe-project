const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getInventoryById,
  updateStock,
  checkInventoryLevels
} = require('../controllers/inventorycontroller');

router.get('/', getAllInventory);
router.get('/:id', getInventoryById);
router.post('/update-stock', updateStock);
router.post('/check-levels', checkInventoryLevels);

module.exports = router;