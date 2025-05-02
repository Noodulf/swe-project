const express = require('express');
const router = express.Router();
const {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  getPurchaseOrderHistory,
  approvePurchaseOrder,
  createSupplyRequest,
  debugPurchaseOrder
} = require('../controllers/purchaseOrdercontroller');

router.get('/', getAllPurchaseOrders);
router.get('/history', getPurchaseOrderHistory);
router.get('/:id', getPurchaseOrderById);
router.get('/:id/debug', debugPurchaseOrder);
router.post('/', createPurchaseOrder);
router.post('/supply-requests', createSupplyRequest);
router.put('/:id/status', updatePurchaseOrderStatus);
router.put('/:id/approve', approvePurchaseOrder);

module.exports = router;