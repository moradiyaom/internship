const express = require('express');
const router = express.Router();
const {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getReservations);
router.get('/:id', protect, getReservation);
router.post('/', protect, createReservation);
router.put('/:id', protect, updateReservation);
router.delete('/:id', protect, deleteReservation);

module.exports = router;

