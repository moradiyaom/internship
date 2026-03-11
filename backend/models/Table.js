const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: [true, 'Please add a table number'],
    unique: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Please add table capacity'],
    min: 1,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available',
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'vip'],
    default: 'indoor',
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Table', tableSchema);

