const express = require('express');
const router = express.Router();
const {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getTables);
router.get('/:id', protect, getTable);
router.post('/', protect, authorize('manager'), createTable);
router.put('/:id', protect, authorize('manager'), updateTable);
router.delete('/:id', protect, authorize('manager'), deleteTable);

module.exports = router;

