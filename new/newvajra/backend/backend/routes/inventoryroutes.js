const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getInventoryById,
  updateStock,
  checkInventoryLevels,
  getChefInventory,
  recordIngredientConsumption,
  updateInventoryOnDelivery,
  calculateThresholds
} = require('../controllers/inventorycontroller');

router.get('/', getAllInventory);
router.get('/chef', getChefInventory);
router.get('/:id', getInventoryById);
router.post('/update-stock', updateStock);
router.post('/check-levels', checkInventoryLevels);
router.post('/consumption', recordIngredientConsumption);
router.post('/delivery', updateInventoryOnDelivery);
router.post('/calculate-thresholds', calculateThresholds);

module.exports = router;