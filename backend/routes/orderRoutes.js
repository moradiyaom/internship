const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  processPayment,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, authorize('waiter', 'manager'), createOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/payment', protect, authorize('manager', 'waiter'), processPayment);
router.delete('/:id', protect, authorize('manager'), deleteOrder);

module.exports = router;
