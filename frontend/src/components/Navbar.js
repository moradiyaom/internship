import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={user ? "/dashboard" : "/"}>🍽️ Restaurant Management</Link>
      </div>
      <button
        className="hamburger"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
        {user ? (
          <>
            {user.role === 'manager' && <Link to="/dashboard">Dashboard</Link>}
            <Link to="/menu-management">Menu</Link>
            <Link to="/orders">Orders</Link>
            {user.role === 'manager' && <Link to="/tables">Tables</Link>}
            {user.role === 'manager' && <Link to="/reservations">Reservations</Link>}
            {user.role === 'manager' && <Link to="/staff">Staff</Link>}
            <Link to="/QRCode">QR Code</Link>
            <div className="navbar-user">
              <span>Welcome, {user.name} ({user.role})</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
