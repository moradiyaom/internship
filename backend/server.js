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

// Auto-seed data if needed
const seedDataIfNeeded = async () => {
  try {
    const User = require('./models/User');
    const Menu = require('./models/Menu');
    const Table = require('./models/Table');
    
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('Seeding initial data...');
      
      // Create default users
      await User.create({
        name: 'Manager',
        email: 'manager@restaurant.com',
        password: 'password123',
        role: 'manager',
        phone: '1234567890',
      });
      
      await User.create({
        name: 'Waiter',
        email: 'waiter@restaurant.com',
        password: 'password123',
        role: 'waiter',
        phone: '1234567891',
      });
      
      await User.create({
        name: 'Chef',
        email: 'chef@restaurant.com',
        password: 'password123',
        role: 'chef',
        phone: '1234567892',
      });
      
      // Create menu items
      await Menu.create([
        { name: 'Spring Rolls', description: 'Crispy vegetable spring rolls', category: 'appetizer', price: 8.99, preparationTime: 12 },
        { name: 'Garlic Bread', description: 'Fresh baked bread with garlic butter', category: 'appetizer', price: 6.99, preparationTime: 8 },
        { name: 'Caesar Salad', description: 'Fresh romaine lettuce with Caesar dressing', category: 'salad', price: 12.99, preparationTime: 10 },
        { name: 'Grilled Chicken', description: 'Tender grilled chicken breast', category: 'main course', price: 18.99, preparationTime: 25 },
        { name: 'Chicken Burger', description: 'Grilled chicken burger with fries', category: 'main course', price: 15.99, preparationTime: 20 },
        { name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce and mozzarella', category: 'main course', price: 14.99, preparationTime: 15 },
        { name: 'Chocolate Cake', description: 'Rich chocolate layer cake', category: 'dessert', price: 8.99, preparationTime: 5 },
        { name: 'Coffee', description: 'Hot brewed coffee', category: 'beverage', price: 3.99, preparationTime: 3 },
      ]);
      
      // Create tables
      await Table.create([
        { tableNumber: '1', capacity: 2, location: 'indoor', status: 'available' },
        { tableNumber: '2', capacity: 2, location: 'indoor', status: 'available' },
        { tableNumber: '3', capacity: 4, location: 'indoor', status: 'available' },
        { tableNumber: '4', capacity: 4, location: 'indoor', status: 'available' },
        { tableNumber: '5', capacity: 6, location: 'indoor', status: 'available' },
      ]);
      
      console.log('Seed data created successfully!');
    } else {
      console.log('Database already has data, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Call seed function after database connection
setTimeout(seedDataIfNeeded, 2000);

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

// Serve frontend build
const path = require('path');
app.use(express.static('../frontend/build'));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
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
