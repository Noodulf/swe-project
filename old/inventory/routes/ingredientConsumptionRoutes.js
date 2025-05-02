const express = require('express');
const router = express.Router();
const { 
  createConsumption,
  getAllConsumptions,
  getConsumptionById,
  getConsumptionsByIngredient
} = require('../controllers/ingredientConsumptionController');

// Debug middleware
router.use((req, res, next) => {
  console.log('Ingredient Consumption Route hit:', req.method, req.url);
  next();
});

// Create a new consumption record
router.post('/', createConsumption);

// Get all consumption records
router.get('/', getAllConsumptions);

// Get a specific consumption record
router.get('/:id', getConsumptionById);

// Get all consumption records for a specific ingredient
router.get('/ingredient/:ingredientId', getConsumptionsByIngredient);

module.exports = router; 