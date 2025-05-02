const express = require('express');
const router = express.Router();
const { 
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

router.post('/', createSupplier);
router.get('/', getAllSuppliers); // Route to get all suppliers
router.get('/:id', getSupplierById); // Route to get a supplier by ID
router.put('/:id', updateSupplier); // Route to update a supplier
router.delete('/:id', deleteSupplier); // Route to delete a supplier

module.exports = router;