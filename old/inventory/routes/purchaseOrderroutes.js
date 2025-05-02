const express = require('express');
const router = express.Router();
const {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  getPurchaseOrderHistory,
  approvePurchaseOrder
} = require('../controllers/purchaseOrdercontroller');

router.get('/', getAllPurchaseOrders);
router.get('/history', getPurchaseOrderHistory);
router.get('/:id', getPurchaseOrderById);
router.post('/', createPurchaseOrder);
router.put('/:id/status', updatePurchaseOrderStatus);
router.put('/:id/approve', approvePurchaseOrder);

module.exports = router;