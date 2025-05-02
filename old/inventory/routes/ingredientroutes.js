const express = require('express');
const router = express.Router();
const { createIngredient, getAllIngredients, getIngredientById } = require('../controllers/ingredientController');

router.post('/', createIngredient);
router.get('/', getAllIngredients); // Route to get all ingredients
router.get('/:id', getIngredientById); // Route to get an ingredient by ID

module.exports = router;