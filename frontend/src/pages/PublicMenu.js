import React, { useState, useEffect } from 'react';
import menuService from '../services/menuService';
import { formatINR } from '../utils/currency';
import './CustomerMenu.css';

const CustomerMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const data = await menuService.getAll();
      setMenuItems(data.filter(item => item.isAvailable !== false));
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  return (
    <div className="customer-menu-page">
      <div className="page-header">
        <h1>🍽️ Restaurant Menu</h1>
        
      </div>

      <div className="menu-grid">
        {menuItems.map((item) => (
          <div key={item._id} className="menu-card">
            <h3>{item.name}</h3>
            <p className="category">{item.category.toUpperCase()}</p>
            {item.description && <p className="description">{item.description}</p>}
            <div className="menu-footer">
              <span className="price">{formatINR(item.price)}</span>
              <span className="time">{item.preparationTime || 15} min prep</span>
            </div>
          </div>
        ))}
      </div>

      {menuItems.length === 0 && (
        <p className="empty-state">Menu coming soon!</p>
      )}
    </div>
  );
};

export default CustomerMenu;

