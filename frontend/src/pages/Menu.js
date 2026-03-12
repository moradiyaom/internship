import React, { useState, useEffect } from 'react';
import menuService from '../services/menuService';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import './Menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'main course',
    price: '',
    preparationTime: 15,
    isAvailable: true,
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const data = await menuService.getAll();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await menuService.update(editingItem._id, formData);
      } else {
        await menuService.create(formData);
      }
      fetchMenu();
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Error saving menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      preparationTime: item.preparationTime || 15,
      isAvailable: item.isAvailable !== false,
    });
    setShowForm(true);
  };

const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await menuService.delete(id);
      fetchMenu();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Error deleting menu item');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      // Optimistic update
      setMenuItems(prev => prev.map(i => 
        i._id === item._id ? { ...i, isAvailable: !item.isAvailable } : i
      ));
      await menuService.toggleAvailability(item._id, item.isAvailable);
    } catch (error) {
      // Revert on error
      fetchMenu();
      console.error('Error toggling availability:', error);
      alert('Error toggling availability');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'main course',
      price: '',
      preparationTime: 15,
      isAvailable: true,
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const canEdit = user?.role === 'manager' || user?.role === 'chef';

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  return (
    <div className="menu-page">
      <div className="page-header">
        <h1>Menu Management</h1>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add Menu Item
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{editingItem ? 'Edit' : 'Add'} Menu Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="appetizer">Appetizer</option>
                  <option value="main course">Main Course</option>
                  <option value="dessert">Dessert</option>
                  <option value="beverage">Beverage</option>
                  <option value="salad">Salad</option>
                  <option value="soup">Soup</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Preparation Time (minutes)</label>
                <input
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  Available
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="menu-grid">
        {menuItems.map((item) => (
          <div key={item._id} className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}>
            <h3>{item.name}</h3>
            <p className="category">{item.category}</p>
            {item.description && <p className="description">{item.description}</p>}
            <div className="menu-footer">
              <span className="price">{formatINR(item.price)}</span>
              <span className="time">{item.preparationTime} min</span>
            </div>
            {!item.isAvailable && <span className="badge">Unavailable</span>}
{canEdit && (
              <div className="menu-actions">
                <button 
                  className={`toggle-btn ${item.isAvailable ? 'available' : 'unavailable'}`}
                  onClick={() => handleToggleAvailability(item)}
                >
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </button>
                <button onClick={() => handleEdit(item)}>Edit</button>
                {user?.role === 'manager' && (
                  <button onClick={() => handleDelete(item._id)} className="delete">Delete</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {menuItems.length === 0 && (
        <p className="empty-state">No menu items yet. Add your first item!</p>
      )}
    </div>
  );
};

export default Menu;

