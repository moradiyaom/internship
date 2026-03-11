const express = require('express');
const router = express.Router();
const {
  getStaff,
  getStaffMember,
  updateStaff,
  deleteStaff,
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('manager'), getStaff);
router.get('/:id', protect, authorize('manager'), getStaffMember);
router.put('/:id', protect, authorize('manager'), updateStaff);
router.delete('/:id', protect, authorize('manager'), deleteStaff);

module.exports = router;

