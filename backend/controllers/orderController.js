const Order = require('../models/Order');
const Table = require('../models/Table');
const Menu = require('../models/Menu');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate('table', 'tableNumber')
      .populate('waiter', 'name email')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'tableNumber')
      .populate('waiter', 'name email')
      .populate('items.menuItem', 'name price description');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Waiter, Manager)
const createOrder = async (req, res) => {
  try {
    const { tableId, items, notes } = req.body;

    // Calculate total amount and prepare items with prices
    let totalAmount = 0;
    const itemsWithPrices = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.menuItem} not found` });
      }
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      
      itemsWithPrices.push({
        menuItem: item.menuItem,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions,
      });
    }

    // Generate unique order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      table: tableId,
      waiter: req.user.id,
      items: itemsWithPrices,
      totalAmount,
      notes,
    });

    // Update table status if table is provided
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, {
        status: 'occupied',
        currentOrder: order._id,
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('table', 'tableNumber')
      .populate('waiter', 'name email')
      .populate('items.menuItem', 'name price');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('table', 'tableNumber')
      .populate('waiter', 'name email')
      .populate('items.menuItem', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If order is completed or cancelled, free up the table
    if (status === 'completed' || status === 'cancelled') {
      if (order.table) {
        const tableId = order.table._id || order.table;
        if (tableId) {
          await Table.findByIdAndUpdate(tableId, {
            status: 'available',
            currentOrder: null,
          });
        }
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process payment
// @route   PUT /api/orders/:id/payment
// @access  Private (Manager only)
const processPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    // First get the order to check table reference
    const orderBeforeUpdate = await Order.findById(req.params.id);
    if (!orderBeforeUpdate) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update payment status
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: 'paid',
        paymentMethod,
      },
      { new: true }
    )
      .populate('table', 'tableNumber')
      .populate('waiter', 'name email')
      .populate('items.menuItem', 'name price');

    // Update table status if order has a table
    if (orderBeforeUpdate.table) {
      await Table.findByIdAndUpdate(orderBeforeUpdate.table, {
        status: 'available',
        currentOrder: null,
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Manager only)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Free up the table if order has a table
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: 'available',
        currentOrder: null,
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  processPayment,
  deleteOrder,
};
