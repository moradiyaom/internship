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
router.post('/', protect, authorize('manager', 'chef'), createMenuItem);
router.put('/:id', protect, authorize('manager', 'chef'), updateMenuItem);
router.delete('/:id', protect, authorize('manager', 'chef'), deleteMenuItem);

module.exports = router;

