import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Tables.css';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tableId, newStatus) => {
    try {
      await api.put(`/tables/${tableId}`, { status: newStatus });
      fetchTables();
    } catch (error) {
      console.error('Error updating table status:', error);
      alert(error.response?.data?.message || 'Error updating table status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#10b981',
      occupied: '#ef4444',
      reserved: '#f59e0b',
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusIcon = (status) => {
    const icons = {
      available: '✓',
      occupied: '●',
      reserved: '◐',
    };
    return icons[status] || '○';
  };

  if (loading) {
    return <div className="loading">Loading tables...</div>;
  }

  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;

  return (
    <div className="tables-page">
      <div className="page-header">
        <h1>Table Management</h1>
        <div className="table-stats">
          <div className="stat-item">
            <span className="stat-label">Available:</span>
            <span className="stat-value available">{availableCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Occupied:</span>
            <span className="stat-value occupied">{occupiedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Reserved:</span>
            <span className="stat-value reserved">{reservedCount}</span>
          </div>
        </div>
      </div>

      <div className="tables-grid">
        {tables.length === 0 ? (
          <p className="empty-state">No tables configured</p>
        ) : (
          tables.map((table) => (
            <div
              key={table._id}
              className="table-card"
              style={{ borderLeftColor: getStatusColor(table.status) }}
            >
              <div className="table-header">
                <div>
                  <h3>Table {table.tableNumber}</h3>
                  <p className="table-location">{table.location || 'Indoor'}</p>
                </div>
                <div className="status-container">
                  <span className="status-icon">{getStatusIcon(table.status)}</span>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(table.status) }}
                  >
                    {table.status}
                  </span>
                </div>
              </div>
              <div className="table-info">
                <div className="info-row">
                  <span className="info-label">👥 Capacity:</span>
                  <span className="info-value">{table.capacity} seats</span>
                </div>
                
                {table.currentOrderId && (
                  <div className="info-row">
                    <span className="info-label">📋 Order:</span>
                    <span className="info-value">#{table.currentOrderId.slice(-6)}</span>
                  </div>
                )}
              </div>
              <div className="table-actions">
                {table.status === 'occupied' && (
                  <button
                    onClick={() => handleStatusUpdate(table._id, 'available')}
                    className="btn-free"
                  >
                    Free Table
                  </button>
                )}
                {table.status === 'available' && (
                  <button
                    onClick={() => handleStatusUpdate(table._id, 'reserved')}
                    className="btn-reserve"
                  >
                    Mark Reserved
                  </button>
                )}
                {table.status === 'reserved' && (
                  <button
                    onClick={() => handleStatusUpdate(table._id, 'available')}
                    className="btn-available"
                  >
                    Mark Available
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tables;

