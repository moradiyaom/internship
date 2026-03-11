const Order = require('../models/Order');
const PDFDocument = require('pdfkit');

// @desc    Get daily sales report
// @route   GET /api/reports/daily
// @access  Private (Manager only)
const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const orders = await Order.find({
      createdAt: { $gte: targetDate, $lt: nextDate },
      paymentStatus: 'paid',
    })
      .populate('table', 'tableNumber')
      .populate('waiter', 'name')
      .populate('items.menuItem', 'name price');

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=daily-report-${targetDate.toISOString().split('T')[0]}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Daily Sales Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${targetDate.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary:', { underline: true });
    doc.fontSize(12).text(`Total Orders: ${totalOrders}`);
    doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    doc.moveDown();

    // Orders details
    doc.fontSize(14).text('Order Details:', { underline: true });
    doc.moveDown();

    orders.forEach((order, index) => {
      doc.fontSize(11).text(`${index + 1}. Order #${order.orderNumber}`);
      doc.text(`   Table: ${order.table ? order.table.tableNumber : 'N/A'}`);
      doc.text(`   Waiter: ${order.waiter ? order.waiter.name : 'N/A'}`);
      doc.text(`   Items: ${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}`);
      doc.text(`   Total: ₹${order.totalAmount.toFixed(2)}`);
      doc.text(`   Payment: ${order.paymentMethod}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weekly sales report
// @route   GET /api/reports/weekly
// @access  Private (Manager only)
const getWeeklyReport = async (req, res) => {
  try {
    const { startDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const orders = await Order.find({
      createdAt: { $gte: start, $lt: end },
      paymentStatus: 'paid',
    })
      .populate('table', 'tableNumber')
      .populate('waiter', 'name')
      .populate('items.menuItem', 'name price');

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=weekly-report-${start.toISOString().split('T')[0]}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Weekly Sales Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Week: ${start.toLocaleDateString()} - ${new Date(end - 1).toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary:', { underline: true });
    doc.fontSize(12).text(`Total Orders: ${totalOrders}`);
    doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    doc.moveDown();

    // Orders details
    doc.fontSize(14).text('Order Details:', { underline: true });
    doc.moveDown();

    orders.forEach((order, index) => {
      doc.fontSize(11).text(`${index + 1}. Order #${order.orderNumber} - ${new Date(order.createdAt).toLocaleDateString()}`);
      doc.text(`   Table: ${order.table ? order.table.tableNumber : 'N/A'}`);
      doc.text(`   Waiter: ${order.waiter ? order.waiter.name : 'N/A'}`);
      doc.text(`   Items: ${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}`);
      doc.text(`   Total: ₹${order.totalAmount.toFixed(2)}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly sales report
// @route   GET /api/reports/monthly
// @access  Private (Manager only)
const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) - 1 : new Date().getMonth();

    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 1);

    const orders = await Order.find({
      createdAt: { $gte: start, $lt: end },
      paymentStatus: 'paid',
    })
      .populate('table', 'tableNumber')
      .populate('waiter', 'name')
      .populate('items.menuItem', 'name price');

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=monthly-report-${currentYear}-${currentMonth + 1}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Monthly Sales Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Month: ${start.toLocaleString('default', { month: 'long' })} ${currentYear}`, { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary:', { underline: true });
    doc.fontSize(12).text(`Total Orders: ${totalOrders}`);
    doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    doc.moveDown();

    // Orders details
    doc.fontSize(14).text('Order Details:', { underline: true });
    doc.moveDown();

    orders.forEach((order, index) => {
      doc.fontSize(11).text(`${index + 1}. Order #${order.orderNumber} - ${new Date(order.createdAt).toLocaleDateString()}`);
      doc.text(`   Table: ${order.table ? order.table.tableNumber : 'N/A'}`);
      doc.text(`   Waiter: ${order.waiter ? order.waiter.name : 'N/A'}`);
      doc.text(`   Items: ${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}`);
      doc.text(`   Total: ₹${order.totalAmount.toFixed(2)}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cash payment report
// @route   GET /api/reports/cash
// @access  Private (Manager only)
const getCashReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lt: end },
      paymentStatus: 'paid',
      paymentMethod: 'cash',
    })
      .populate('table', 'tableNumber')
      .populate('waiter', 'name');

    const totalCash = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=cash-payment-report.pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Cash Payment Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary:', { underline: true });
    doc.fontSize(12).text(`Total Cash Orders: ${totalOrders}`);
    doc.text(`Total Cash Received: ₹${totalCash.toFixed(2)}`);
    doc.moveDown();

    // Orders details
    doc.fontSize(14).text('Cash Orders:', { underline: true });
    doc.moveDown();

    orders.forEach((order, index) => {
      doc.fontSize(11).text(`${index + 1}. Order #${order.orderNumber}`);
      doc.text(`   Date: ${new Date(order.createdAt).toLocaleString()}`);
      doc.text(`   Table: ${order.table ? order.table.tableNumber : 'N/A'}`);
      doc.text(`   Amount: ₹${order.totalAmount.toFixed(2)}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get UPI payment report
// @route   GET /api/reports/upi
// @access  Private (Manager only)
const getUPIReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lt: end },
      paymentStatus: 'paid',
      paymentMethod: 'upi',
    })
      .populate('table', 'tableNumber')
      .populate('waiter', 'name');

    const totalUPI = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=upi-payment-report.pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('UPI Payment Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary:', { underline: true });
    doc.fontSize(12).text(`Total UPI Orders: ${totalOrders}`);
    doc.text(`Total UPI Received: ₹${totalUPI.toFixed(2)}`);
    doc.moveDown();

    // Orders details
    doc.fontSize(14).text('UPI Orders:', { underline: true });
    doc.moveDown();

    orders.forEach((order, index) => {
      doc.fontSize(11).text(`${index + 1}. Order #${order.orderNumber}`);
      doc.text(`   Date: ${new Date(order.createdAt).toLocaleString()}`);
      doc.text(`   Table: ${order.table ? order.table.tableNumber : 'N/A'}`);
      doc.text(`   Amount: ₹${order.totalAmount.toFixed(2)}`);
      if (order.razorpayPaymentId) {
        doc.text(`   Payment ID: ${order.razorpayPaymentId}`);
      }
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get card payment report
// @route   GET /api/reports/card
// @access  Private (Manager only)
const getCardReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lt: end },
      paymentStatus: 'paid',
      paymentMethod: 'card',
    })
      .populate('table', 'tableNumber')
      .populate('waiter', 'name');

    const totalCard = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=card-payment-report.pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Card Payment Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary:', { underline: true });
    doc.fontSize(12).text(`Total Card Orders: ${totalOrders}`);
    doc.text(`Total Card Received: ₹${totalCard.toFixed(2)}`);
    doc.moveDown();

    // Orders details
    doc.fontSize(14).text('Card Orders:', { underline: true });
    doc.moveDown();

    orders.forEach((order, index) => {
      doc.fontSize(11).text(`${index + 1}. Order #${order.orderNumber}`);
      doc.text(`   Date: ${new Date(order.createdAt).toLocaleString()}`);
      doc.text(`   Table: ${order.table ? order.table.tableNumber : 'N/A'}`);
      doc.text(`   Amount: ₹${order.totalAmount.toFixed(2)}`);
      if (order.razorpayPaymentId) {
        doc.text(`   Payment ID: ${order.razorpayPaymentId}`);
      }
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order receipt
// @route   GET /api/reports/order/:id/receipt
// @access  Private (Manager only)
const getOrderReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'tableNumber')
      .populate('waiter', 'name')
      .populate('items.menuItem', 'name price description');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${order.orderNumber}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(24).text('RESTAURANT BILL', { align: 'center' });
    doc.moveDown();
    
    // Order info
    doc.fontSize(12).text(`Order Number: ${order.orderNumber}`, { align: 'center' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, { align: 'center' });
    if (order.table) {
      doc.text(`Table: ${order.table.tableNumber}`, { align: 'center' });
    }
    doc.text(`Waiter: ${order.waiter ? order.waiter.name : 'N/A'}`, { align: 'center' });
    doc.moveDown();

    // Items
    doc.fontSize(14).text('Items:', { underline: true });
    doc.moveDown(0.5);

    let subtotal = 0;
    order.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      doc.fontSize(12).text(`${item.name} x ${item.quantity} = ₹${itemTotal.toFixed(2)}`);
    });

    doc.moveDown();
    doc.fontSize(14).text('-----------------------------------');
    doc.fontSize(14).text(`Subtotal: ₹${subtotal.toFixed(2)}`);
    doc.fontSize(14).text(`Total: ₹${order.totalAmount.toFixed(2)}`);
    doc.moveDown();

    // Payment info
    doc.fontSize(12).text('-----------------------------------');
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`);
    doc.text(`Payment Method: ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}`);
    if (order.razorpayPaymentId) {
      doc.text(`Payment ID: ${order.razorpayPaymentId}`);
    }
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).text('Thank you for dining with us!', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getCashReport,
  getUPIReport,
  getCardReport,
  getOrderReceipt,
};
