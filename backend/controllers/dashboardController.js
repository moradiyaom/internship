const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const Menu = require('../models/Menu');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Manager only)
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's revenue
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      paymentStatus: 'paid',
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Total orders today
    const todayOrdersCount = todayOrders.length;

    // Pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Available tables
    const availableTables = await Table.countDocuments({ status: 'available' });

    // Today's reservations
    const todayReservations = await Reservation.countDocuments({
      reservationDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    // Menu items count
    const menuItemsCount = await Menu.countDocuments({ isAvailable: true });

    res.json({
      todayRevenue,
      todayOrdersCount,
      pendingOrders,
      availableTables,
      todayReservations,
      menuItemsCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};

