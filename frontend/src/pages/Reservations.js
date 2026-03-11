import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Reservations.css';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    table: '',
    reservationDate: '',
    reservationTime: '',
    numberOfGuests: '',
    specialRequests: '',
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reservationDateTime = new Date(`${formData.reservationDate}T${formData.reservationTime}`);
      
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        table: formData.table || undefined,
        reservationDate: reservationDateTime,
        numberOfGuests: parseInt(formData.numberOfGuests),
        specialRequests: formData.specialRequests || undefined,
      };

      if (editingReservation) {
        await api.put(`/reservations/${editingReservation._id}`, payload);
      } else {
        await api.post('/reservations', payload);
      }

      fetchReservations();
      resetForm();
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert(error.response?.data?.message || 'Error saving reservation');
    }
  };

  const handleEdit = (reservation) => {
    const date = new Date(reservation.reservationDate);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().slice(0, 5);
    
    setFormData({
      customerName: reservation.customerName || '',
      customerPhone: reservation.customerPhone || '',
      customerEmail: reservation.customerEmail || '',
      table: reservation.table?._id || reservation.table || '',
      reservationDate: dateStr,
      reservationTime: timeStr,
      numberOfGuests: reservation.numberOfGuests || '',
      specialRequests: reservation.specialRequests || '',
    });
    setEditingReservation(reservation);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      fetchReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Error cancelling reservation');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/reservations/${id}`, { status });
      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      alert('Error updating reservation status');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      table: '',
      reservationDate: '',
      reservationTime: '',
      numberOfGuests: '',
      specialRequests: '',
    });
    setEditingReservation(null);
    setShowForm(false);
  };

  const canEdit = user?.role === 'waiter' || user?.role === 'manager';

  if (loading) {
    return <div className="loading">Loading reservations...</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#27ae60',
      seated: '#3498db',
      completed: '#2ecc71',
      cancelled: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="reservations-page">
      <div className="page-header">
        <h1>Reservations</h1>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + New Reservation
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{editingReservation ? 'Edit' : 'Create'} Reservation</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.reservationDate}
                    onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    value={formData.reservationTime}
                    onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Number of Guests *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfGuests}
                    onChange={(e) => setFormData({ ...formData, numberOfGuests: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Table (Optional)</label>
                  <select
                    value={formData.table}
                    onChange={(e) => setFormData({ ...formData, table: e.target.value })}
                  >
                    <option value="">No table assigned</option>
                    {tables
                      .filter(table => table.status === 'available' || table._id === formData.table)
                      .map(table => (
                        <option key={table._id} value={table._id}>
                          Table {table.tableNumber} ({table.capacity} seats)
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Special Requests</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows="3"
                  placeholder="Any special requests or notes..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="reservations-list">
        {reservations.length === 0 ? (
          <p className="empty-state">No reservations yet</p>
        ) : (
          reservations.map((reservation) => (
            <div key={reservation._id} className="reservation-card">
              <div className="reservation-header">
                <div>
                  <h3>{reservation.customerName}</h3>
                  <p className="reservation-date">{formatDate(reservation.reservationDate)}</p>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(reservation.status) }}
                >
                  {reservation.status}
                </span>
              </div>
              <div className="reservation-info">
                <div className="info-row">
                  <span className="info-label">📞 Phone:</span>
                  <span>{reservation.customerPhone}</span>
                </div>
                {reservation.customerEmail && (
                  <div className="info-row">
                    <span className="info-label">📧 Email:</span>
                    <span>{reservation.customerEmail}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">👥 Guests:</span>
                  <span>{reservation.numberOfGuests}</span>
                </div>
                {reservation.table && (
                  <div className="info-row">
                    <span className="info-label">🪑 Table:</span>
                    <span>Table {reservation.table.tableNumber || reservation.table}</span>
                  </div>
                )}
                {reservation.specialRequests && (
                  <div className="info-row">
                    <span className="info-label">📝 Notes:</span>
                    <span>{reservation.specialRequests}</span>
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="reservation-actions">
                  {reservation.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(reservation._id, 'confirmed')}
                      className="btn-status"
                    >
                      Confirm
                    </button>
                  )}
                  {reservation.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(reservation._id, 'seated')}
                      className="btn-status"
                    >
                      Mark as Seated
                    </button>
                  )}
                  {reservation.status === 'seated' && (
                    <button
                      onClick={() => handleStatusUpdate(reservation._id, 'completed')}
                      className="btn-status"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(reservation)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusUpdate(reservation._id, 'cancelled')}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  )}
                  {(reservation.status === 'cancelled' || reservation.status === 'completed') && (
                    <button
                      onClick={() => handleDelete(reservation._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reservations;
