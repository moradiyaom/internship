import React, { useState, useEffect } from 'react';
import { formatINR } from '../utils/currency';
import api from '../services/api';
import './CustomerMenu.css'; // Will create next

const CustomerMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data.filter(item => item.isAvailable));
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(cartItem => cartItem._id === item._id);
    if (existing) {
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (!tableNumber) return alert('Enter table number');
    // In production, send to backend /api/orders
    alert(`Order placed for Table ${tableNumber}!\nTotal: ${formatINR(getCartTotal())}\nNotify staff.`);
    setCart([]);
  };

  if (loading) return <div className="loading">Loading menu...</div>;

  return (
    <div className="customer-menu">
      <div className="customer-header">
        <h1>🍽️ Welcome to Our Menu</h1>
        <p>Scan & Order from your table</p>
      </div>

      <div className="table-input">
        <input
          type="text"
          placeholder="Table Number (e.g., Table 5)"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
        />
      </div>

      <div className="menu-grid">
        {menuItems.map((item) => (
          <div key={item._id} className="menu-item" onClick={() => addToCart(item)}>
            <img src={item.image || '/placeholder-food.jpg'} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>{item.description || ''}</p>
              <div className="item-footer">
                <span className="price">{formatINR(item.price)}</span>
                <span className="prep-time">{item.preparationTime} min</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart-summary">
          <h3>🛒 Your Order ({cart.length} items)</h3>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item._id}>
                {item.name} x{item.quantity} - {formatINR(item.price * item.quantity)}
              </div>
            ))}
          </div>
          <div className="total">Total: {formatINR(getCartTotal())}</div>
          <button className="place-order-btn" onClick={placeOrder}>
            📋 Place Order for Table {tableNumber || '?'} 
          </button>
        </div>
      )}

      <div className="customer-footer">
        <p>Questions? Ask your waiter.</p>
      </div>
    </div>
  );
};

export default CustomerMenu;

