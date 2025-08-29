import React, { useState, useEffect } from 'react';
import { FaFlask, FaSearch, FaEye, FaEdit, FaCheck, FaTimes, FaClock, FaUser, FaFileAlt, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import './LabTestManagement.css';

const LabTestManagement = () => {
  const [orders, setOrders] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [orderTestItems, setOrderTestItems] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    date: '',
    search: ''
  });
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingData, setBillingData] = useState({
    orderId: '',
    paymentMethod: 'cash',
    amount: 0,
    discount: 0,
    notes: ''
  });

  useEffect(() => {
    loadOrders();
    loadCollections();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lab-tests/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await fetch('/api/lab-tests/sample-collection');
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  // Load test items for a specific order
  const loadOrderTestItems = async (orderId) => {
    try {
      const response = await fetch(`/api/lab-tests/orders/${orderId}/items`);
      if (response.ok) {
        const data = await response.json();
        setOrderTestItems(prev => ({
          ...prev,
          [orderId]: data.items
        }));
      }
    } catch (error) {
      console.error('Error loading test items:', error);
    }
  };

  // Update setSelectedOrder to also load test items
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    if (order && order.id) {
      loadOrderTestItems(order.id);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/lab-tests/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        loadOrders();
        loadCollections();
        alert(`Order status updated to ${status}`);
      } else {
        alert('Error updating order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const updateCollection = async (collectionId, collectionData) => {
    try {
      const response = await fetch(`/api/lab-tests/sample-collection/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collectionData),
      });

      if (response.ok) {
        loadCollections();
        setSelectedCollection(null);
        alert('Sample collection updated successfully');
      } else {
        alert('Error updating sample collection');
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      alert('Error updating sample collection');
    }
  };

  // Billing Functions
  const openBillingModal = (order) => {
    setBillingData({
      orderId: order.orderId,
      paymentMethod: 'cash',
      amount: order.totalAmount || 0,
      discount: 0,
      notes: ''
    });
    setShowBillingModal(true);
  };

  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find the order by orderId to get the actual database ID
      const order = orders.find(o => o.orderId === billingData.orderId);
      if (!order) {
        alert('Order not found');
        return;
      }

      const response = await fetch(`/api/lab-tests/orders/${order.id}/billing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          paymentMethod: billingData.paymentMethod,
          amount: billingData.amount,
          discount: billingData.discount,
          notes: billingData.notes
        }),
      });

      if (response.ok) {
        setShowBillingModal(false);
        setBillingData({
          orderId: '',
          paymentMethod: 'cash',
          amount: 0,
          discount: 0,
          notes: ''
        });
        loadOrders();
        alert('Billing completed successfully! Sample collection can now be scheduled.');
      } else {
        alert('Error completing billing');
      }
    } catch (error) {
      console.error('Error completing billing:', error);
      alert('Error completing billing');
    }
  };

  const canScheduleCollection = (order) => {
    return order.paymentStatus === 'paid' && order.status === 'ordered';
  };

  const scheduleSampleCollection = async (order) => {
    try {
      const response = await fetch('/api/lab-tests/sample-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          patientId: order.patientId,
          collectionDate: new Date().toISOString().split('T')[0],
          collectionTime: '09:00',
          collectorName: '',
          collectorId: '',
          sampleType: 'Blood', // Default, can be updated
          sampleQuantity: '5ml', // Default, can be updated
          collectionNotes: '',
          status: 'pending',
          priority: order.priority
        }),
      });

      if (response.ok) {
        loadCollections();
        alert('Sample collection scheduled successfully!');
      } else {
        alert('Error scheduling sample collection');
      }
    } catch (error) {
      console.error('Error scheduling sample collection:', error);
      alert('Error scheduling sample collection');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ordered': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency': return '#ef4444';
      case 'urgent': return '#f59e0b';
      case 'routine': return '#10b981';
      default: return '#6b7280';
    }
  };



  const filteredOrders = orders.filter(order => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.priority && order.priority !== filters.priority) return false;
    if (filters.date && !order.orderDate.includes(filters.date)) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        order.patientFirstName.toLowerCase().includes(searchTerm) ||
        order.patientLastName.toLowerCase().includes(searchTerm) ||
        order.orderId.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  const filteredCollections = collections.filter(collection => {
    if (filters.status && collection.status !== filters.status) return false;
    if (filters.priority && collection.priority !== filters.priority) return false;
    if (filters.date && !collection.collectionDate?.includes(filters.date)) return false;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        collection.patientFirstName.toLowerCase().includes(searchTerm) ||
        collection.patientLastName.toLowerCase().includes(searchTerm) ||
        collection.collectionId.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  return (
    <div className="lab-test-management">
      <div className="management-header">
        <h2><FaFlask /> Laboratory Test Management</h2>
        <p>Manage lab test orders and sample collection</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FaFileAlt /> Lab Test Orders ({orders.length})
        </button>
        <button 
          className={`tab ${activeTab === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          <FaUser /> Sample Collection ({collections.length})
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="ordered">Ordered</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority:</label>
            <select 
              value={filters.priority} 
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="">All Priorities</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date:</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by patient name or ID..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'orders' && (
        <div className="orders-section">
          <h3>Lab Test Orders</h3>
          
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h4>{order.orderId}</h4>
                    <div className="order-badges">
                      <span 
                        className="status-badge"
                        style={{ background: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                      <span 
                        className="priority-badge"
                        style={{ background: getPriorityColor(order.priority) }}
                      >
                        {order.priority}
                      </span>
                      <span 
                        className={`payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}
                      >
                        {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <strong>Patient:</strong> {order.patientFirstName} {order.patientLastName}
                    </div>
                    <div className="detail-row">
                      <strong>Doctor:</strong> {order.doctorName}
                    </div>
                    <div className="detail-row">
                      <strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                    <div className="detail-row">
                      <strong>Amount:</strong> ₹{order.totalAmount}
                    </div>
                  </div>

                  {/* Test Summary */}
                  <div className="test-summary">
                    <div className="summary-item">
                      <span className="summary-label">Tests:</span>
                      <span className="summary-value">{order.testCount || 'N/A'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total:</span>
                      <span className="summary-value">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      onClick={() => handleOrderSelect(order)}
                      className="btn btn-primary btn-sm"
                    >
                      <FaEye /> View Details
                    </button>
                    
                    {/* Billing Button - Show when payment is pending */}
                    {order.paymentStatus === 'pending' && (
                      <button 
                        onClick={() => openBillingModal(order)}
                        className="btn btn-info btn-sm"
                      >
                        <FaCreditCard /> Complete Billing
                      </button>
                    )}
                    
                    {/* Sample Collection Button - Show after billing is complete */}
                    {canScheduleCollection(order) && (
                      <button 
                        onClick={() => scheduleSampleCollection(order)}
                        className="btn btn-success btn-sm"
                      >
                        <FaUser /> Schedule Collection
                      </button>
                    )}
                    
                    {/* Processing Buttons */}
                    {order.status === 'ordered' && order.paymentStatus === 'paid' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'in_progress')}
                        className="btn btn-warning btn-sm"
                      >
                        <FaClock /> Start Processing
                      </button>
                    )}
                    {order.status === 'in_progress' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="btn btn-success btn-sm"
                      >
                        <FaCheck /> Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredOrders.length === 0 && !loading && (
            <div className="no-data">
              <p>No lab test orders found matching the current filters.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="collections-section">
          <h3>Sample Collection</h3>
          
          <div className="collections-grid">
            {filteredCollections.map(collection => (
              <div key={collection.id} className="collection-card">
                <div className="collection-header">
                  <h4>{collection.collectionId}</h4>
                  <span 
                    className="status-badge"
                    style={{ background: getStatusColor(collection.status) }}
                  >
                    {collection.status}
                  </span>
                </div>

                <div className="collection-details">
                  <div className="detail-row">
                    <strong>Patient:</strong> {collection.patientFirstName} {collection.patientLastName}
                  </div>
                  <div className="detail-row">
                    <strong>Order ID:</strong> {collection.orderUniqueId}
                  </div>
                  <div className="detail-row">
                    <strong>Priority:</strong> 
                    <span 
                      className="priority-badge"
                      style={{ background: getPriorityColor(collection.priority) }}
                    >
                      {collection.priority}
                    </span>
                  </div>
                  {collection.collectionDate && (
                    <div className="detail-row">
                      <strong>Collection Date:</strong> {new Date(collection.collectionDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="collection-actions">
                  <button 
                    onClick={() => setSelectedCollection(collection)}
                    className="btn btn-primary btn-sm"
                  >
                    <FaEdit /> Update Collection
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCollections.length === 0 && (
            <div className="no-data">
              <p>No sample collection records found matching the current filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Order Details - {selectedOrder.orderId}</h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="detail-section">
                <h4>Patient Information</h4>
                <p><strong>Name:</strong> {selectedOrder.patientFirstName} {selectedOrder.patientLastName}</p>
                <p><strong>Patient ID:</strong> {selectedOrder.patientUniqueId}</p>
                <p><strong>Doctor:</strong> {selectedOrder.doctorName}</p>
                <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
              </div>

              <div className="detail-section">
                <h4>Test Details</h4>
                <p><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}</p>
                <p><strong>Priority:</strong> {selectedOrder.priority}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                {selectedOrder.clinicalNotes && (
                  <p><strong>Clinical Notes:</strong> {selectedOrder.clinicalNotes}</p>
                )}
                {selectedOrder.instructions && (
                  <p><strong>Instructions:</strong> {selectedOrder.instructions}</p>
                )}
              </div>

              {/* Individual Test Items */}
              <div className="detail-section">
                <h4>Prescribed Tests</h4>
                {orderTestItems[selectedOrder.id] && orderTestItems[selectedOrder.id].length > 0 ? (
                  <div className="test-items-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Test Name</th>
                          <th>Test Code</th>
                          <th>Price (₹)</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderTestItems[selectedOrder.id].map((item, index) => (
                          <tr key={index}>
                            <td>{item.testName}</td>
                            <td>{item.testCode}</td>
                            <td>₹{item.price}</td>
                            <td>{item.clinicalNotes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Loading test items...</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Actions</h4>
                <div className="action-buttons">
                  {selectedOrder.status === 'ordered' && (
                    <button 
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'in_progress');
                        setSelectedOrder(null);
                      }}
                      className="btn btn-warning"
                    >
                      <FaClock /> Start Processing
                    </button>
                  )}
                  {selectedOrder.status === 'in_progress' && (
                    <button 
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'completed');
                        setSelectedOrder(null);
                      }}
                      className="btn btn-success"
                    >
                      <FaCheck /> Mark Complete
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collection Update Modal */}
      {selectedCollection && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Update Sample Collection - {selectedCollection.collectionId}</h3>
              <button 
                onClick={() => setSelectedCollection(null)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const collectionData = {
                  collectionDate: formData.get('collectionDate'),
                  collectionTime: formData.get('collectionTime'),
                  collectorName: formData.get('collectorName'),
                  collectorId: formData.get('collectorId'),
                  sampleType: formData.get('sampleType'),
                  sampleQuantity: formData.get('sampleQuantity'),
                  collectionNotes: formData.get('collectionNotes'),
                  status: formData.get('status')
                };
                updateCollection(selectedCollection.id, collectionData);
              }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Collection Date:</label>
                    <input
                      type="date"
                      name="collectionDate"
                      defaultValue={selectedCollection.collectionDate?.split('T')[0] || ''}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Collection Time:</label>
                    <input
                      type="time"
                      name="collectionTime"
                      defaultValue={selectedCollection.collectionTime || ''}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Collector Name:</label>
                    <input
                      type="text"
                      name="collectorName"
                      defaultValue={selectedCollection.collectorName || ''}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Collector ID:</label>
                    <input
                      type="text"
                      name="collectorId"
                      defaultValue={selectedCollection.collectorId || ''}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sample Type:</label>
                    <input
                      type="text"
                      name="sampleType"
                      defaultValue={selectedCollection.sampleType || ''}
                      placeholder="e.g., Blood, Urine, etc."
                    />
                  </div>
                  <div className="form-group">
                    <label>Sample Quantity:</label>
                    <input
                      type="text"
                      name="sampleQuantity"
                      defaultValue={selectedCollection.sampleQuantity || ''}
                      placeholder="e.g., 5ml, 100ml, etc."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Collection Notes:</label>
                  <textarea
                    name="collectionNotes"
                    defaultValue={selectedCollection.collectionNotes || ''}
                    rows="3"
                    placeholder="Any special notes about the collection..."
                  />
                </div>

                <div className="form-group">
                  <label>Status:</label>
                  <select name="status" defaultValue={selectedCollection.status}>
                    <option value="pending">Pending</option>
                    <option value="collected">Collected</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <FaCheck /> Update Collection
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSelectedCollection(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Billing Modal */}
      {showBillingModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Complete Lab Test Billing</h3>
              <button 
                onClick={() => setShowBillingModal(false)}
                className="close-btn"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              <form onSubmit={handleBillingSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Order ID:</label>
                    <input
                      type="text"
                      value={billingData.orderId}
                      disabled
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Method:</label>
                    <select
                      value={billingData.paymentMethod}
                      onChange={(e) => setBillingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="form-input"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="insurance">Insurance</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Amount:</label>
                    <input
                      type="number"
                      value={billingData.amount}
                      onChange={(e) => setBillingData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      className="form-input"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Discount:</label>
                    <input
                      type="number"
                      value={billingData.discount}
                      onChange={(e) => setBillingData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      className="form-input"
                      step="0.01"
                      min="0"
                      max={billingData.amount}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Billing Notes:</label>
                  <textarea
                    value={billingData.notes}
                    onChange={(e) => setBillingData(prev => ({ ...prev, notes: e.target.value }))}
                    className="form-input"
                    rows="3"
                    placeholder="Any special notes about the billing..."
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <FaMoneyBillWave /> Complete Billing
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowBillingModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTestManagement;
