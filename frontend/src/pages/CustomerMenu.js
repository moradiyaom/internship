import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { formatINR } from '../utils/currency';
import './CustomerMenu.css';

const CustomerMenu = () => {
  const { tableId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      // Auto-detect API URL based on current host
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const API_URL = process.env.REACT_APP_API_URL || `${protocol}//${hostname}:5001`;
      const response = await axios.get(`${API_URL}/api/menu`);
      const availableItems = response.data.filter(item => item.isAvailable !== false);
      setMenuItems(availableItems);
      
      // Get unique categories
      const uniqueCategories = [...new Set(availableItems.map(item => item.category))];
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem._id === item._id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem._id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem => 
        cartItem._id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem._id !== itemId));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }

    try {
      // Auto-detect API URL based on current host
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const API_URL = process.env.REACT_APP_API_URL || `${protocol}//${hostname}:5001`;
      const orderData = {
        tableId: tableId,
        customerName: customerName,
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity
        })),
        notes: 'Order placed via QR code'
      };

      await axios.post(`${API_URL}/api/orders`, orderData);
      setOrderPlaced(true);
      setCart([]);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return <div className="customer-loading">Loading menu...</div>;
  }

  if (orderPlaced) {
    return (
      <div className="customer-container">
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been sent to the kitchen.</p>
          <p>Table Number: {tableId || 'N/A'}</p>
          <p>Total Amount: {formatINR(calculateTotal())}</p>
          <button onClick={() => setOrderPlaced(false)} className="btn-order-more">
            Order More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-container">
      <div className="customer-header">
        <h1>🍽️ Restaurant Menu</h1>
        <p>Scan QR code to view our menu</p>
      </div>

      <div className="category-filter">
        <button 
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item._id} className="menu-card">
            <div className="menu-info">
              <h3>{item.name}</h3>
              <p className="menu-description">{item.description}</p>
              <span className="menu-category">{item.category}</span>
            </div>
            <div className="menu-action">
              <span className="menu-price">{formatINR(item.price)}</span>
              <button onClick={() => addToCart(item)} className="btn-add">
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart-summary" onClick={() => setShowCart(true)}>
          <span>🛒 {cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          <span className="cart-total">Total: {formatINR(calculateTotal())}</span>
          <span className="view-cart">View Cart →</span>
        </div>
      )}

      {showCart && (
        <div className="cart-modal">
          <div className="cart-content">
            <div className="cart-header">
              <h2>Your Order</h2>
              <button className="btn-close" onClick={() => setShowCart(false)}>×</button>
            </div>
            
            <div className="cart-items">
              {cart.map(item => (
                <div key={item._id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <span className="item-price">{formatINR(item.price)} each</span>
                  </div>
                  <div className="item-quantity">
                    <button onClick={() => removeFromCart(item._id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => addToCart(item)}>+</button>
                  </div>
                  <div className="item-subtotal">
                    {formatINR(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="cart-total-final">
                <span>Total:</span>
                <span className="total-amount">{formatINR(calculateTotal())}</span>
              </div>

              <button onClick={placeOrder} className="btn-place-order">
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;

