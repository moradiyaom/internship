import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import menuService from '../services/menuService';
import api from '../services/api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [showCashDetails, setShowCashDetails] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Load menu items on mount to enable order enrichment
    fetchMenuItems();
  }, []);

  useEffect(() => {
    // Re-enrich orders when menu items are loaded
    if (menuItems.length > 0 && orders.length > 0) {
      const enrichedOrders = enrichOrdersWithMenuDetails(orders);
      setOrders(enrichedOrders);
    }
  }, [menuItems]);

  useEffect(() => {
    // Fetch orders on mount and every 5 seconds
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showOrderForm) {
      fetchTables();
      fetchMenuItems();
    }
  }, [showOrderForm]);

  const enrichOrdersWithMenuDetails = (ordersData) => {
    if (!ordersData || ordersData.length === 0) return ordersData;
    
    return ordersData.map(order => ({
      ...order,
      items: order.items?.map(item => {
          // Check if we have a name from stored value
        let itemName = item.name;
        let itemPrice = item.price;
        
        // If name is empty/missing, try to get from populated menuItem
        if (!itemName && item.menuItem?.name) {
          itemName = item.menuItem.name;
        }
        
        // If price is empty/missing, try to get from populated menuItem
        if (!itemPrice && item.menuItem?.price) {
          itemPrice = item.menuItem.price;
        }
        
        // Final fallback
        if (!itemName) {
          itemName = 'Unnamed Item';
        }
        if (!itemPrice) {
          itemPrice = 0;
        }
        
        return {
          ...item,
          name: itemName,
          price: itemPrice,
          subtotal: item.subtotal || (itemPrice * (item.quantity || 1))
        };
      }) || []
    }));
  };

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAll();
      const enrichedData = enrichOrdersWithMenuDetails(data);
      setOrders(enrichedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const fetchMenuItems = async () => {
    try {
      const data = await menuService.getAll();
      setMenuItems(data.filter(item => item.isAvailable !== false));
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };


  const loadRazorpay = async (order) => {
    try {
      const res = await fetch("http://localhost:5001/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: order.totalAmount, // Razorpay needs paise
          orderId: order._id
        }),
      });
  
      if (!res.ok) {
        alert("Failed to create payment order");
        return;
      }

      const razorpayOrder = await res.json();
      console.log('Razorpay Order Created:', razorpayOrder);
  
      const options = {
        key: "rzp_test_RxKSa3qBeXb7ll", // 🔴 move to .env in production
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "Resto App",
        description: "Food Order Payment",
        order_id: razorpayOrder.id,
    
        handler: async function (response) {
          console.log('Razorpay Handler Response:', response);
          try {
            const verify = await fetch(
              "http://localhost:5001/api/payment/verify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: order._id
                }),
              }
            );
    
            const result = await verify.json();
            console.log('Verification Result:', result);
    
            if (result.success) {
              alert("Payment Successful ✓");
              
              // The order is already updated on backend, just fetch to show receipt
              await fetchOrders();
              const updatedOrders = await orderService.getAll();
              const paidOrder = updatedOrders.find(o => o._id === order._id);
              setCompletedOrder(paidOrder);
              setShowReceiptModal(true);
              setShowPaymentModal(false);
            } else {
              alert("Payment verification failed: " + (result.message || "Unknown error"));
              console.error('Verification failed:', result);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert("Payment verification error: " + error.message);
          }
        },
        
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed by user');
          }
        },
        
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        
        theme: { color: "#3399cc" }
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error loading Razorpay:', error);
      alert("Error loading payment gateway: " + error.message);
    }
  };
  

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedOrderForPayment) return;

    // 🔥 DIGITAL PAYMENT (Razorpay) → Card, UPI, Digital
    if (["card", "upi"].includes(paymentMethod)) {
      loadRazorpay(selectedOrderForPayment);
      return;
    }

    // If cash payment, check if cash amount is sufficient
    if (paymentMethod === 'cash' && !showCashDetails) {
      setShowCashDetails(true);
      return;
    }

    if (paymentMethod === 'cash') {
      const totalAmount = selectedOrderForPayment.totalAmount || 0;
      const cashReceived = parseFloat(cashAmount);
      
      if (!cashAmount || cashReceived < totalAmount) {
        alert(`Cash received (${formatINR(cashReceived)}) must be at least equal to total amount (${formatINR(totalAmount)})`);
        return;
      }
    }

    try {
      await orderService.processPayment(selectedOrderForPayment._id, paymentMethod);
      alert('Payment processed successfully!');
      
      // Fetch updated order and show receipt
      const updatedOrders = await orderService.getAll();
      const paidOrder = updatedOrders.find(o => o._id === selectedOrderForPayment._id);
      setCompletedOrder(paidOrder);
      setShowReceiptModal(true);
      setShowPaymentModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error processing payment:', error);
      const errorMessage = error.response?.data?.message || 'Error processing payment';
      
      // Check if it's an authorization error
      if (errorMessage.includes('not authorized') && errorMessage.includes('waiter')) {
        alert('Authorization Error: Your session may have an old token. Please log out and log back in as Manager to process payments.');
      } else {
        alert(errorMessage);
      }
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedOrderForPayment(null);
    setPaymentMethod('cash');
    setCashAmount('');
    setShowCashDetails(false);
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setCompletedOrder(null);
  };

  const openPaymentModal = (order) => {
    setSelectedOrderForPayment(order);
    setShowPaymentModal(true);
    setShowCashDetails(false);
    setCashAmount('');
  };

  const calculateChange = () => {
    if (!selectedOrderForPayment || !cashAmount) return 0;
    const totalAmount = selectedOrderForPayment.totalAmount || 0;
    const cashReceived = parseFloat(cashAmount) || 0;
    return Math.max(0, cashReceived - totalAmount);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setShowCashDetails(false);
    setCashAmount('');
  };

  const handleAddItem = (menuItem) => {
    const existingItem = selectedItems.find(item => item.menuItem === menuItem._id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        item.menuItem === menuItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        menuItem: menuItem._id,
        quantity: 1,
        name: menuItem.name,
        price: menuItem.price
      }]);
    }
  };

  const handleRemoveItem = (menuItemId) => {
    setSelectedItems(selectedItems.filter(item => item.menuItem !== menuItemId));
  };

  const handleUpdateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(menuItemId);
      return;
    }
    setSelectedItems(selectedItems.map(item =>
      item.menuItem === menuItemId
        ? { ...item, quantity: parseInt(quantity) }
        : item
    ));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      alert('Please select a table');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    try {
      const orderData = {
        tableId: selectedTable,
        items: selectedItems.map(item => ({
          menuItem: item.menuItem,
          quantity: item.quantity
        })),
        notes: notes
      };

      await orderService.create(orderData);
      alert('Order created successfully!');
      setShowOrderForm(false);
      resetOrderForm();
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Error creating order');
    }
  };

  const resetOrderForm = () => {
    setSelectedTable('');
    setSelectedItems([]);
    setNotes('');
  };

  const canUpdateStatus = user?.role === 'chef' || user?.role === 'manager';
  const canCreateOrder = user?.role === 'waiter' || user?.role === 'manager';
  const canProcessPayment = user?.role === 'manager';

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      preparing: '#3498db',
      ready: '#9b59b6',
      served: '#27ae60',
      completed: '#2ecc71',
      cancelled: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        {canCreateOrder && (
          <button onClick={() => setShowOrderForm(true)} className="btn-primary">
            + New Order
          </button>
        )}
      </div>

      {showOrderForm && canCreateOrder && (
        <div className="form-modal">
          <div className="form-content order-form">
            <h2>Create New Order</h2>
            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label>Select Table *</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  required
                >
                  <option value="">Choose a table...</option>
                  {tables.map(table => (
                    <option key={table._id} value={table._id}>
                      Table {table.tableNumber} ({table.capacity} seats) - {table.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Menu Items *</label>
                <div className="menu-items-selection">
                  {menuItems.map(item => (
                    <div key={item._id} className="menu-item-option">
                      <div className="menu-item-info">
                        <span className="menu-item-name">{item.name}</span>
                        <span className="menu-item-price">{formatINR(item.price)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddItem(item)}
                        className="btn-add-item"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="form-group">
                  <label>Selected Items</label>
                  <div className="selected-items">
                    {selectedItems.map(item => (
                      <div key={item.menuItem} className="selected-item">
                        <span className="item-name">{item.name}</span>
                        <div className="item-controls">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.menuItem, item.quantity - 1)}
                            className="btn-quantity"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.menuItem, parseInt(e.target.value) || 1)}
                            className="quantity-input"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.menuItem, item.quantity + 1)}
                            className="btn-quantity"
                          >
                            +
                          </button>
                          <span className="item-subtotal">{formatINR(item.price * item.quantity)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.menuItem)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="order-total">
                      <strong>Total: {formatINR(calculateTotal())}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Create Order</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOrderForm(false);
                    resetOrderForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="orders-list">
        {orders.length === 0 ? (
          <p className="empty-state">No orders yet</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p className="order-time">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                <h4>📋 Ordered Food Items:</h4>
                {order.items && order.items.length > 0 ? (
                  <div className="items-container">
                    <div className="items-summary">
                      <span className="items-count">Total Items: <strong>{order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)}</strong></span>
                    </div>
                    <div className="items-table">
                      <div className="items-header">
                        <span className="col-name">🍽️ Dish Name</span>
                        <span className="col-qty">📦 Qty</span>
                        <span className="col-price">💰 Price</span>
                        <span className="col-subtotal">💵 Subtotal</span>
                      </div>
                      {order.items.map((item, idx) => {
                        // Use the name directly from the item (now stored in DB)
                        const displayName = item.name && item.name.trim() 
                          ? item.name 
                          : `Food Item ${idx + 1}`;
                        return (
                          <div key={idx} className="items-row">
                            <span className="col-name">{displayName}</span>
                            <span className="col-qty">{item.quantity || 1}x</span>
                            <span className="col-price">{formatINR(item.price || 0)}</span>
                            <span className="col-subtotal">{formatINR(item.subtotal || (item.price || 0) * (item.quantity || 1))}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="no-items">No items in order</p>
                )}
              </div>

              <div className="order-footer">
                <div className="order-info">
                  <p><strong>Table:</strong> {order.tableId?.tableNumber || 'N/A'}</p>
                  <p><strong>Total:</strong> {formatINR(order.totalAmount)}</p>
                  <p><strong>Payment:</strong> {order.paymentStatus || 'unpaid'}</p>
                </div>
                {canUpdateStatus && (
                  <div className="order-actions">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'preparing')}
                        className="btn-status"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'ready')}
                        className="btn-status"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'served')}
                        className="btn-status"
                      >
                        Mark Served
                      </button>
                    )}
                    {order.status === 'served' && order.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'completed')}
                        className="btn-status"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                )}
                {canProcessPayment && order.status === 'completed' && order.paymentStatus !== 'paid' && (
                  <div className="order-actions">
                    <button
                      onClick={() => openPaymentModal(order)}
                      className="btn-payment"
                    >
                      Process Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showPaymentModal && selectedOrderForPayment && (
        <div className="form-modal">
          <div className="form-content payment-form">
            <h2>Process Payment</h2>
            <form onSubmit={handleProcessPayment}>
              <div className="form-group">
                <label>Order Number</label>
                <input
                  type="text"
                  value={selectedOrderForPayment.orderNumber || `#${selectedOrderForPayment._id.slice(-6)}`}
                  disabled
                  className="form-input-disabled"
                />
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <input
                  type="text"
                  value={formatINR(selectedOrderForPayment.totalAmount)}
                  disabled
                  className="form-input-disabled"
                />
              </div>
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  required
                  disabled={showCashDetails}
                >
                  <option value="cash">Cash (₹)</option>
                  <option value="card">Card (₹)</option>
                  <option value="upi">UPI (₹)</option>
                  {/*<option value="digital">Digital Payment - Razorpay (₹)</option>*/}
                </select>
              </div>

              {paymentMethod === 'cash' && showCashDetails && (
                <div className="cash-payment-details">
                  <div className="form-group">
                    <label>Cash Received from Customer (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min={selectedOrderForPayment.totalAmount || 0}
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Enter cash amount"
                      required
                      className="cash-amount-input"
                      autoFocus
                    />
                  </div>
                  <div className="payment-summary">
                    <div className="summary-row">
                      <span>Total Amount:</span>
                      <span className="amount">{formatINR(selectedOrderForPayment.totalAmount)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Cash Received:</span>
                      <span className="amount">{formatINR(parseFloat(cashAmount) || 0)}</span>
                    </div>
                    <div className="summary-row change-row">
                      <span><strong>Change to Give:</strong></span>
                      <span className="amount change-amount">
                        {formatINR(calculateChange())}
                      </span>
                    </div>
                    {cashAmount && parseFloat(cashAmount) < (selectedOrderForPayment.totalAmount || 0) && (
                      <div className="error-message">
                        ⚠️ Cash received is less than total amount!
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="form-actions">
                {paymentMethod === 'cash' && !showCashDetails ? (
                  <button type="submit" className="btn-primary">Continue with Cash</button>
                ) : (
                  <button type="submit" className="btn-primary">
                    {["digital", "card", "upi"].includes(paymentMethod) ? "Pay with " + paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1) : "Process Payment"}
                  </button>
                )}
                {showCashDetails && paymentMethod === 'cash' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCashDetails(false);
                      setCashAmount('');
                    }}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReceiptModal && completedOrder && (
        <div className="form-modal">
          <div className="form-content receipt-modal">
            <h2>✓ Payment Successful</h2>
            <div className="receipt-header">
              <p className="receipt-order-id">Order #{completedOrder._id.slice(-6)}</p>
              <p className="receipt-date">{new Date(completedOrder.createdAt).toLocaleString()}</p>
            </div>

            <div className="receipt-items">
              <h3>Order Items</h3>
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td className="qty-center">{item.quantity}</td>
                      <td className="price-right">{formatINR(item.price || 0)}</td>
                      <td className="price-right">{formatINR(item.subtotal || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="receipt-summary">
              <div className="summary-section">
                <div className="summary-row">
                  <span><strong>Table No:</strong></span>
                  <span>{completedOrder.tableId?.tableNumber || 'N/A'}</span>
                </div>
                <div className="summary-row">
                  <span><strong>Payment Method:</strong></span>
                  <span className="payment-method">{completedOrder.paymentMethod || 'Cash'}</span>
                </div>
                <div className="summary-row">
                  <span><strong>Payment Status:</strong></span>
                  <span className="status-paid">✓ Paid</span>
                </div>
              </div>

              <div className="receipt-total">
                <div className="total-row">
                  <span><strong>Total Amount:</strong></span>
                  <span className="total-amount">{formatINR(completedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="receipt-footer">
              <p>Thank you for your order!</p>
            </div>

            <div className="form-actions">
              <button
                onClick={closeReceiptModal}
                className="btn-primary"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

