import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatINR } from '../utils/currency';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    activeTables: 0,
    pendingOrders: 0,
    allOrdersCount: 0,
    allTimeRevenue: 0,
    paidOrders: 0,
    unpaidOrders: 0,
    cashPayments: 0,
    digitalPayments: 0,
    cardPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        api.get('/orders'),
        api.get('/tables'),
      ]);

      const orders = ordersRes.data;
      const today = new Date().toISOString().split('T')[0];
      
      // Today's stats
      const ordersToday = orders.filter(
        (order) => order.createdAt?.split('T')[0] === today
      );
      const revenueToday = ordersToday
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      // All time stats
      const allOrdersCount = orders.length;
      const paidOrders = orders.filter((o) => o.paymentStatus === 'paid').length;
      const unpaidOrders = orders.filter((o) => o.paymentStatus === 'unpaid').length;
      const allTimeRevenue = orders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      // Payment method breakdown
      const cashPayments = orders
        .filter((o) => o.paymentStatus === 'paid' && o.paymentMethod === 'cash')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const digitalPayments = orders
        .filter((o) => o.paymentStatus === 'paid' && o.paymentMethod === 'digital')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const cardPayments = orders
        .filter((o) => o.paymentStatus === 'paid' && o.paymentMethod === 'card')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      const pendingOrders = orders.filter((o) => 
        ['pending', 'preparing'].includes(o.status)
      ).length;
      const activeTables = tablesRes.data.filter(
        (t) => t.status === 'occupied'
      ).length;

      setStats({
        ordersToday: ordersToday.length,
        revenueToday,
        activeTables,
        pendingOrders,
        allOrdersCount,
        allTimeRevenue,
        paidOrders,
        unpaidOrders,
        cashPayments,
        digitalPayments,
        cardPayments,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      

      {/* Key Metrics */}
      <div className="dashboard-section">
        <h2 className="section-title">Key Metrics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>📋 Orders Today</h3>
            <p className="stat-value">{stats.ordersToday}</p>
          </div>
          <div className="stat-card">
            <h3>💰 Revenue Today</h3>
            <p className="stat-value">{formatINR(stats.revenueToday)}</p>
          </div>
          <div className="stat-card">
            <h3>🪑 Active Tables</h3>
            <p className="stat-value">{stats.activeTables}</p>
          </div>
          <div className="stat-card">
            <h3>⏳ Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
        </div>
      </div>

      {/* All Time Statistics */}
      <div className="dashboard-section">
        <h2 className="section-title">📈 All Time Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>🛒 Total Orders</h3>
            <p className="stat-value">{stats.allOrdersCount}</p>
          </div>
          <div className="stat-card">
            <h3>💵 Total Revenue</h3>
            <p className="stat-value">{formatINR(stats.allTimeRevenue)}</p>
          </div>
          <div className="stat-card">
            <h3>✅ Paid Orders</h3>
            <p className="stat-value">{stats.paidOrders}</p>
          </div>
          <div className="stat-card">
            <h3>❌ Unpaid Orders</h3>
            <p className="stat-value">{stats.unpaidOrders}</p>
          </div>
        </div>
      </div>


      {/* Payment Settlement */}
    
      <div className="dashboard-section">
        <h2 className="section-title">💳 Payment Settlement</h2>
        <div className="settlement-grid">
          <div className="settlement-card cash">
            <div className="settlement-header">
              <h3>💵 Cash Payments</h3>
              <span className="settlement-icon">₹</span>
            </div>
            <p className="settlement-amount">{formatINR(stats.cashPayments)}</p>
            <p className="settlement-label">Total cash received</p>
          </div>

          <div className="settlement-card digital">
            <div className="settlement-header">
              <h3>💳 Digital Payments</h3>
              <span className="settlement-icon">📱</span>
            </div>
            <p className="settlement-amount">{formatINR(stats.digitalPayments)}</p>
            <p className="settlement-label">Razorpay & Online</p>
          </div>

          <div className="settlement-card card">
            <div className="settlement-header">
              <h3>🏧 Card Payments</h3>
              <span className="settlement-icon">💳</span>
            </div>
            <p className="settlement-amount">{formatINR(stats.cardPayments)}</p>
            <p className="settlement-label">Debit/Credit Cards</p>
          </div>
        </div>

        {/* Payment Summary */}
        
        <div className="payment-summary">
          <div className="summary-row">
            <span className="summary-label">Cash + Digital + Card</span>
            <span className="summary-value">
              {formatINR(stats.cashPayments + stats.digitalPayments + stats.cardPayments)}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Expected Total Revenue</span>
            <span className="summary-value">{formatINR(stats.allTimeRevenue)}</span>
          </div>
          <div className="summary-row settlement-match">
            <span className="summary-label">Settlement Status</span>
            <span className="summary-status">
              {(stats.cashPayments + stats.digitalPayments + stats.cardPayments) === stats.allTimeRevenue
                ? '⚠️ Discrepancy'
                : '✅ Matched'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

