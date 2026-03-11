const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Please add customer name'],
  },
  customerPhone: {
    type: String,
    required: [true, 'Please add customer phone'],
  },
  customerEmail: {
    type: String,
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
  },
  reservationDate: {
    type: Date,
    required: [true, 'Please add reservation date'],
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Please add number of guests'],
    min: 1,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled'],
    default: 'pending',
  },
  specialRequests: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Reservation', reservationSchema);

