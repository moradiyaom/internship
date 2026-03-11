const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', protect, authorize('manager'), createMenuItem);
router.put('/:id', protect, authorize('manager'), updateMenuItem);
router.delete('/:id', protect, authorize('manager'), deleteMenuItem);

module.exports = router;

