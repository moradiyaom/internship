const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const connectDB = require('./config/db');
const Order = require('./models/Order');
const Table = require('./models/Table');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* =======================
   RAZORPAY CONFIG
======================= */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =======================
   RAZORPAY ROUTES
======================= */

// Create Order
app.post('/api/payment/create-order', async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // INR → paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Order creation failed', error: error.message });
  }
});

// Verify Payment
app.post('/api/payment/verify', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  console.log('=== PAYMENT VERIFICATION DEBUG ===');
  console.log('Request body:', req.body);
  console.log('Razorpay Order ID:', razorpay_order_id);
  console.log('Razorpay Payment ID:', razorpay_payment_id);
  console.log('Razorpay Signature:', razorpay_signature);
  console.log('Order ID from frontend:', orderId);

  try {
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID is required' 
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing Razorpay payment details' 
      });
    }

    // Verify the signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    console.log('Generated signature:', generated_signature);
    console.log('Received signature:', razorpay_signature);
    console.log('Signatures match:', generated_signature === razorpay_signature);

    if (generated_signature === razorpay_signature) {
      console.log('Signature verified! Updating order...');
      
      // Signature is valid - update order in database
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          paymentMethod: 'digital',
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          paidAt: new Date(),
          status: 'completed',
        },
        { new: true }
      )
        .populate('table', 'tableNumber')
        .populate('waiter', 'name email')
        .populate('items.menuItem', 'name price');

      console.log('Updated order:', order);

      // Update table status if order has a table
      if (order && order.table) {
        console.log('Updating table status to available');
        await Table.findByIdAndUpdate(order.table, {
          status: 'available',
          currentOrder: null,
        });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Payment verified and order updated', 
        order 
      });
    } else {
      console.log('Signature verification failed');
      res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed - Invalid signature' 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Verification error', 
      error: error.message 
    });
  }
});

/* =======================
   EXISTING ROUTES
======================= */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Restaurant Management System API with Razorpay' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
