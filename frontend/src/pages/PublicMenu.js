import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatINR } from '../utils/currency';
import './Menu.css';

const PublicMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'appetizer', 'main course', 'dessert', 'beverage', 'salad', 'soup'];

  const filteredItems = categoryFilter === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === categoryFilter);

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  return (
    <div className="menu-page public-menu">
      <div className="page-header">
        <h1>Our Menu</h1>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${categoryFilter === category ? 'active' : ''}`}
            onClick={() => setCategoryFilter(category)}
          >
            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {filteredItems.map((item) => (
          <div key={item._id} className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}>
            <h3>{item.name}</h3>
            <p className="category">{item.category}</p>
            {item.description && <p className="description">{item.description}</p>}
            <div className="menu-footer">
              <span className="price">{formatINR(item.price)}</span>
              <span className="time">{item.preparationTime} min</span>
            </div>
            {!item.isAvailable && <span className="badge">Unavailable</span>}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="empty-state">No menu items found in this category.</p>
      )}

      <div className="public-menu-footer">
        <p>Scan QR code to view our full menu online!</p>
      </div>
    </div>
  );
};

export default PublicMenu;

