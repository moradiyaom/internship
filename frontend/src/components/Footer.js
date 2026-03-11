import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🍽️ Restaurant Management</h3>
            <p>Streamline your restaurant operations with our comprehensive management solution. Manage orders, tables, staff, and more all in one place.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/orders">Orders</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Dashboard Analytics</li>
              <li>Menu Management</li>
              <li>Order Tracking</li>
              <li>Table Management</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li>📧 ommoradiya22@gmail.com</li>
              <li>📞 +91 9484485519</li>
              <li>📍 surat, gujarat, india</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Restaurant Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

