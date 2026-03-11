import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Staff.css';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'waiter',
    phone: '',
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.role === 'manager') {
      fetchStaff();
    }
  }, [user]);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!editingStaff && !payload.password) {
        alert('Password is required for new staff members');
        return;
      }
      if (editingStaff && !payload.password) {
        delete payload.password;
      }

      if (editingStaff) {
        await api.put(`/staff/${editingStaff._id}`, payload);
      } else {
        await api.post('/auth/register', payload);
      }

      fetchStaff();
      resetForm();
      alert(editingStaff ? 'Staff member updated successfully!' : 'Staff member created successfully!');
    } catch (error) {
      console.error('Error saving staff:', error);
      alert(error.response?.data?.message || 'Error saving staff member');
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name || '',
      email: member.email || '',
      password: '',
      role: member.role || 'waiter',
      phone: member.phone || '',
    });
    setEditingStaff(member);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this staff member?')) return;
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
      alert('Staff member deactivated successfully!');
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Error deactivating staff member');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'waiter',
      phone: '',
    });
    setEditingStaff(null);
    setShowForm(false);
  };

  if (user?.role !== 'manager') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only managers can access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading staff...</div>;
  }

  const getRoleColor = (role) => {
    const colors = {
      manager: '#e74c3c',
      waiter: '#3498db',
      chef: '#f39c12',
    };
    return colors[role] || '#95a5a6';
  };

  const getRoleIcon = (role) => {
    const icons = {
      manager: '👔',
      waiter: '👨‍💼',
      chef: '👨‍🍳',
    };
    return icons[role] || '👤';
  };

  return (
    <div className="staff-page">
      <div className="page-header">
        <h1>Staff Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Staff Member
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{editingStaff ? 'Edit' : 'Add'} Staff Member</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingStaff}
                />
              </div>
              <div className="form-group">
                <label>Password {!editingStaff && '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingStaff}
                  placeholder={editingStaff ? 'Leave blank to keep current password' : ''}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    disabled={!!editingStaff && editingStaff.role === 'manager'}
                  >
                    <option value="waiter">Waiter</option>
                    <option value="chef">Chef</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="staff-list">
        {staff.length === 0 ? (
          <p className="empty-state">No staff members found</p>
        ) : (
          staff.map((member) => (
            <div key={member._id} className="staff-card">
              <div className="staff-header">
                <div className="staff-avatar">
                  <span className="avatar-icon">{getRoleIcon(member.role)}</span>
                </div>
                <div className="staff-info-header">
                  <h3>{member.name}</h3>
                  <span
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(member.role) }}
                  >
                    {member.role}
                  </span>
                </div>
              </div>
              <div className="staff-details">
                <div className="detail-item">
                  <span className="detail-label">📧 Email:</span>
                  <span className="detail-value">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="detail-item">
                    <span className="detail-label">📞 Phone:</span>
                    <span className="detail-value">{member.phone}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-indicator ${member.isActive !== false ? 'active' : 'inactive'}`}>
                    {member.isActive !== false ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
              </div>
              <div className="staff-actions">
                <button
                  onClick={() => handleEdit(member)}
                  className="btn-edit"
                >
                  Edit
                </button>
                {member.role !== 'manager' && (
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="btn-delete"
                  >
                    Deactivate
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

export default Staff;
