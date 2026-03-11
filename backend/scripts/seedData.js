const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Menu = require('../models/Menu');
const Table = require('../models/Table');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await User.deleteMany({});
    await Menu.deleteMany({});
    await Table.deleteMany({});

    // Create default users
    const manager = await User.create({
      name: 'Manager',
      email: 'manager@restaurant.com',
      password: 'password123',
      role: 'manager',
      phone: '1234567890',
    });

    const waiter = await User.create({
      name: 'Waiter',
      email: 'waiter@restaurant.com',
      password: 'password123',
      role: 'waiter',
      phone: '1234567891',
    });

    const chef = await User.create({
      name: 'Chef',
      email: 'chef@restaurant.com',
      password: 'password123',
      role: 'chef',
      phone: '1234567892',
    });

    // Create menu items
    const menuItems = await Menu.create([
      // Appetizers
      {
        name: 'Spring Rolls',
        description: 'Crispy vegetable spring rolls with sweet chili sauce',
        category: 'appetizer',
        price: 8.99,
        preparationTime: 12,
      },
      {
        name: 'Garlic Bread',
        description: 'Fresh baked bread with garlic butter',
        category: 'appetizer',
        price: 6.99,
        preparationTime: 8,
      },
      // Salads
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing and croutons',
        category: 'salad',
        price: 12.99,
        preparationTime: 10,
      },
      {
        name: 'Greek Salad',
        description: 'Mixed greens with feta cheese, olives, and vinaigrette',
        category: 'salad',
        price: 11.99,
        preparationTime: 10,
      },
      // Main Courses
      {
        name: 'Grilled Chicken',
        description: 'Tender grilled chicken breast with vegetables and rice',
        category: 'main course',
        price: 18.99,
        preparationTime: 25,
      },
      {
        name: 'Chicken Burger',
        description: 'Grilled chicken burger with fries and coleslaw',
        category: 'main course',
        price: 15.99,
        preparationTime: 20,
      },
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        category: 'main course',
        price: 14.99,
        preparationTime: 15,
      },
      {
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with bacon, eggs, and parmesan',
        category: 'main course',
        price: 16.99,
        preparationTime: 18,
      },
      {
        name: 'Beef Steak',
        description: 'Grilled beef steak with mashed potatoes and vegetables',
        category: 'main course',
        price: 24.99,
        preparationTime: 30,
      },
      // Desserts
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate layer cake with chocolate frosting',
        category: 'dessert',
        price: 8.99,
        preparationTime: 5,
      },
      {
        name: 'Ice Cream',
        description: 'Vanilla, chocolate, or strawberry ice cream',
        category: 'dessert',
        price: 5.99,
        preparationTime: 3,
      },
      {
        name: 'Cheesecake',
        description: 'New York style cheesecake with berry compote',
        category: 'dessert',
        price: 9.99,
        preparationTime: 5,
      },
      // Beverages
      {
        name: 'Coca Cola',
        description: 'Cold carbonated soft drink',
        category: 'beverage',
        price: 2.99,
        preparationTime: 2,
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        category: 'beverage',
        price: 4.99,
        preparationTime: 5,
      },
      {
        name: 'Coffee',
        description: 'Hot brewed coffee',
        category: 'beverage',
        price: 3.99,
        preparationTime: 3,
      },
    ]);

    // Create tables (10 tables total)
    const tables = await Table.create([
      { tableNumber: '1', capacity: 2, location: 'indoor', status: 'available' },
      { tableNumber: '2', capacity: 2, location: 'indoor', status: 'available' },
      { tableNumber: '3', capacity: 4, location: 'indoor', status: 'available' },
      { tableNumber: '4', capacity: 4, location: 'indoor', status: 'available' },
      { tableNumber: '5', capacity: 4, location: 'indoor', status: 'available' },
      { tableNumber: '6', capacity: 6, location: 'indoor', status: 'available' },
      { tableNumber: '7', capacity: 6, location: 'indoor', status: 'available' },
      { tableNumber: '8', capacity: 8, location: 'outdoor', status: 'available' },
      { tableNumber: '9', capacity: 4, location: 'outdoor', status: 'available' },
      { tableNumber: '10', capacity: 4, location: 'indoor', status: 'available' },
    ]);

    console.log('Seed data created successfully!');
    console.log('Users:', { manager: manager.email, waiter: waiter.email, chef: chef.email });
    console.log('Menu items:', menuItems.length);
    console.log('Tables:', tables.length);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

