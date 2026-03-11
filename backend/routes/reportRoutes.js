const express = require('express');
const router = express.Router();
const {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getCashReport,
  getUPIReport,
  getCardReport,
  getOrderReceipt,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/daily', protect, authorize('manager'), getDailyReport);
router.get('/weekly', protect, authorize('manager'), getWeeklyReport);
router.get('/monthly', protect, authorize('manager'), getMonthlyReport);
router.get('/cash', protect, authorize('manager'), getCashReport);
router.get('/upi', protect, authorize('manager'), getUPIReport);
router.get('/card', protect, authorize('manager'), getCardReport);
router.get('/order/:id/receipt', protect, authorize('manager'), getOrderReceipt);

module.exports = router;
