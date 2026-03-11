const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
const getReservations = async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = {};

    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.reservationDate = { $gte: startDate, $lte: endDate };
    }

    const reservations = await Reservation.find(query)
      .populate('table', 'tableNumber capacity')
      .sort({ reservationDate: 1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('table', 'tableNumber capacity location');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);

    // Update table status if table is assigned
    if (reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, {
        status: 'reserved',
      });
    }

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('table', 'tableNumber capacity');

    res.status(201).json(populatedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reservation
// @route   PUT /api/reservations/:id
// @access  Private
const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('table', 'tableNumber capacity');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Update table status based on reservation status
    if (reservation.table) {
      if (reservation.status === 'seated') {
        await Table.findByIdAndUpdate(reservation.table, { status: 'occupied' });
      } else if (reservation.status === 'completed' || reservation.status === 'cancelled') {
        await Table.findByIdAndUpdate(reservation.table, { status: 'available' });
      }
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Update table status
    if (reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, { status: 'available' });
    }

    res.json({ message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  deleteReservation,
};

