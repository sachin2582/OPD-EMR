import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { 
  FaUser, 
  FaCalculator, 
  FaPrint, 
  FaDownload,
  FaCreditCard, 
  FaFileAlt, 
  FaNotesMedical,
  FaHospital,
  FaSearch,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaChartLine,
  FaUserInjured,
  FaCalendarAlt,
  FaPills,
  FaFlask,
  FaReceipt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEdit,
  FaPlus,
  FaFilter,
  FaSort
} from 'react-icons/fa';
import './LabTestBilling.css';

const LabTestBilling = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('unbilled');
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null); 
  const [stats, setStats] = useState({});
  const [userData, setUserData] = useState({});

  // Bill generation form state
  const [billForm, setBillForm] = useState({
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    discount: 0,
    tax: 0,
    notes: '',
    collectedBy: ''
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    collectedBy: '',
    notes: ''
  });

  useEffect(() => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    setUserData(user);
    
    // Set collectedBy to current user
    setBillForm(prev => ({ ...prev, collectedBy: user.name || '' }));
    setPaymentForm(prev => ({ ...prev, collectedBy: user.name || '' }));
    
    loadData();
    loadStats();
  }, [activeTab, currentPage, filterStatus, filterDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'unbilled') {
        console.log('Fetching unbilled prescriptions from e-prescription system...');
        const response = await api.get(`/api/lab-billing/prescriptions/unbilled/regular?page=${currentPage}&limit=10`);
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        setPrescriptions(response.data.prescriptions || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else if (activeTab === 'bills') {
        console.log('Fetching bills...');
        const response = await api.get(`/api/lab-billing/bills?page=${currentPage}&limit=10&paymentStatus=${filterStatus}&date=${filterDate}`);
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        setBills(response.data.bills || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('Fetching stats...');
      const response = await api.get('/api/lab-billing/stats');
      console.log('Stats response status:', response.status);
      console.log('Stats data:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleGenerateBill = async () => {
    if (!selectedPrescription) return;

    try {
      const response = await api.post('/api/lab-billing/bills', {
        prescriptionId: selectedPrescription.id,
        patientId: selectedPrescription.patientId,
        ...billForm
      });

      if (response.status === 201) {
        alert('Bill generated successfully!');
        setShowBillModal(false);
        setSelectedPrescription(null);
        loadData();
        loadStats();
      } else {
        alert(`Error: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating bill:', error);
      alert(`Failed to generate bill: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleUpdatePayment = async () => {
    if (!selectedBill) return;

    try {
      const response = await api.put(`/api/lab-billing/bills/${selectedBill.id}/payment`, paymentForm);

      if (response.status === 200) {
        alert('Payment status updated successfully!');
        setShowPaymentModal(false);
        setSelectedBill(null);
        loadData();
        loadStats();
      } else {
        alert(`Error: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert(`Failed to update payment status: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleViewPrescription = async (prescription) => {
    try {
      // Fetch complete prescription details including prescriptionItems
      const response = await api.get(`/api/lab-billing/prescriptions/${prescription.id}`);
      if (response.status === 200) {
        setSelectedPrescription(response.data);
      } else {
        // Fallback to basic prescription data
        setSelectedPrescription(prescription);
      }
    } catch (error) {
      console.error('Error fetching prescription details:', error);
      // Fallback to basic prescription data
      setSelectedPrescription(prescription);
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        prescription.patientFirstName?.toLowerCase().includes(searchLower) ||
        prescription.patientLastName?.toLowerCase().includes(searchLower) ||
        prescription.patientUniqueId?.toString().includes(searchTerm) ||
        prescription.doctorName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const filteredBills = bills.filter(bill => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        bill.patientFirstName?.toLowerCase().includes(searchLower) ||
        bill.patientLastName?.toLowerCase().includes(searchLower) ||
        bill.billId?.toLowerCase().includes(searchLower) ||
        bill.patientUniqueId?.toString().includes(searchTerm)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Pending' },
      paid: { color: 'success', text: 'Paid' },
      partial: { color: 'info', text: 'Partial' },
      cancelled: { color: 'danger', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'secondary', text: status };
    return <span className={`badge badge-${config.color}`}>{config.text}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      routine: { color: 'info', text: 'Routine' },
      urgent: { color: 'warning', text: 'Urgent' },
      emergency: { color: 'danger', text: 'Emergency' }
    };
    
    const config = priorityConfig[priority] || { color: 'secondary', text: priority };
    return <span className={`badge badge-${config.color}`}>{config.text}</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="lab-test-billing">
      {/* Header */}
     

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaFileAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.prescriptions?.total || 0}</h3>
            <p>Total Prescriptions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaReceipt />
          </div>
          <div className="stat-content">
            <h3>{stats.prescriptions?.unbilled || 0}</h3>
            <p>Unbilled Prescriptions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.bills?.totalRevenue || 0)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.bills?.paid || 0}</h3>
            <p>Paid Bills</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="billing-tabs">
        <button 
          className={`tab-btn ${activeTab === 'unbilled' ? 'active' : ''}`}
          onClick={() => setActiveTab('unbilled')}
        >
          <FaFileAlt /> Unbilled Prescriptions ({stats.prescriptions?.unbilled || 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bills' ? 'active' : ''}`}
          onClick={() => setActiveTab('bills')}
        >
          <FaReceipt /> Lab Bills ({stats.bills?.total || 0})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by patient name, ID, or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          {activeTab === 'bills' && (
            <>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="filter-date"
              />
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="billing-content">
        {activeTab === 'unbilled' && (
          <div className="prescriptions-list">
            <h3>Unbilled Lab Test Prescriptions</h3>
            {loading ? (
              <div className="loading">Loading prescriptions...</div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="no-data">No unbilled prescriptions found</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Diagnosis</th>
                      <th>Priority</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrescriptions.map((prescription) => (
                      <tr key={prescription.id}>
                        <td>
                          <div className="patient-info">
                            <strong>{prescription.patientFirstName} {prescription.patientLastName}</strong>
                            <small>ID: {prescription.patientUniqueId}</small>
                            <small>Phone: {prescription.patientPhone}</small>
                          </div>
                        </td>
                        <td>
                          <div className="doctor-info">
                            <strong>{prescription.doctorName}</strong>
                            <small>{prescription.doctorSpecialization}</small>
                          </div>
                        </td>
                        <td>{formatDate(prescription.prescriptionDate)}</td>
                        <td>{prescription.diagnosis || 'N/A'}</td>
                        <td>{getPriorityBadge(prescription.priority)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-info"
                              onClick={() => handleViewPrescription(prescription)}
                            >
                              <FaEye /> View
                            </button>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                handleViewPrescription(prescription);
                                setShowBillModal(true);
                              }}
                            >
                              <FaReceipt /> Generate Bill
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bills' && (
          <div className="bills-list">
            <h3>Lab Test Bills</h3>
            {loading ? (
              <div className="loading">Loading bills...</div>
            ) : filteredBills.length === 0 ? (
              <div className="no-data">No bills found</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bill ID</th>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr key={bill.id}>
                        <td>
                          <strong>{bill.billId}</strong>
                          {bill.prescriptionUniqueId && (
                            <small>Prescription: {bill.prescriptionUniqueId}</small>
                          )}
                        </td>
                        <td>
                          <div className="patient-info">
                            <strong>{bill.patientFirstName} {bill.patientLastName}</strong>
                            <small>ID: {bill.patientUniqueId}</small>
                            <small>Phone: {bill.patientPhone}</small>
                          </div>
                        </td>
                        <td>{formatDate(bill.billDate)}</td>
                        <td>
                          <strong>{formatCurrency(bill.total)}</strong>
                          {bill.discount > 0 && (
                            <small className="discount">Discount: {formatCurrency(bill.discount)}</small>
                          )}
                        </td>
                        <td>{getStatusBadge(bill.paymentStatus)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-info"
                              onClick={() => setSelectedBill(bill)}
                            >
                              <FaEye /> View
                            </button>
                            {bill.paymentStatus !== 'paid' && (
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setShowPaymentModal(true);
                                }}
                              >
                                <FaCreditCard /> Update Payment
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="btn btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Bill Generation Modal */}
      {showBillModal && selectedPrescription && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Generate Lab Test Bill</h3>
              <button 
                className="close-btn"
                onClick={() => setShowBillModal(false)}
              >
                <FaTimesCircle />
              </button>
            </div>
            <div className="modal-body">
              <div className="prescription-summary">
                <h4>Prescription Details</h4>
                <p><strong>Patient:</strong> {selectedPrescription.patientFirstName} {selectedPrescription.patientLastName}</p>
                <p><strong>Doctor:</strong> {selectedPrescription.doctorName}</p>
                <p><strong>Date:</strong> {formatDate(selectedPrescription.prescriptionDate)}</p>
                <p><strong>Diagnosis:</strong> {selectedPrescription.diagnosis || 'N/A'}</p>
              </div>
              
              <div className="bill-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Bill Date</label>
                    <input
                      type="date"
                      value={billForm.billDate}
                      onChange={(e) => setBillForm(prev => ({ ...prev, billDate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={billForm.dueDate}
                      onChange={(e) => setBillForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Discount (₹)</label>
                    <input
                      type="number"
                      value={billForm.discount}
                      onChange={(e) => setBillForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tax (₹)</label>
                    <input
                      type="number"
                      value={billForm.tax}
                      onChange={(e) => setBillForm(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={billForm.notes}
                    onChange={(e) => setBillForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Collected By</label>
                  <input
                    type="text"
                    value={billForm.collectedBy}
                    onChange={(e) => setBillForm(prev => ({ ...prev, collectedBy: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowBillModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleGenerateBill}
              >
                <FaReceipt /> Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}

             {/* Enhanced Prescription View Modal */}
       {selectedPrescription && !showBillModal && (
         <div className="modal-overlay">
           <div className="modal prescription-modal">
             <div className="modal-header">
               <div className="header-content">
                 <h3><FaFlask /> Lab Test Prescription Details</h3>
                 <p>Comprehensive view of prescribed laboratory tests</p>
               </div>
               <button 
                 className="close-btn"
                 onClick={() => setSelectedPrescription(null)}
               >
                 <FaTimesCircle />
               </button>
             </div>
             <div className="modal-body">
               <div className="prescription-details">
                 {/* Patient Information Card */}
                 <div className="detail-section patient-card">
                   <div className="section-header">
                     <h4><FaUser /> Patient Information</h4>
                   </div>
                   <div className="detail-grid">
                     <div className="detail-item">
                       <label>Full Name:</label>
                       <span className="patient-name">{selectedPrescription.patientFirstName} {selectedPrescription.patientLastName}</span>
                     </div>
                     <div className="detail-item">
                       <label>Patient ID:</label>
                       <span className="patient-id">{selectedPrescription.patientUniqueId}</span>
                     </div>
                     <div className="detail-item">
                       <label>Phone:</label>
                       <span>{selectedPrescription.patientPhone || 'N/A'}</span>
                     </div>
                     <div className="detail-item">
                       <label>Age:</label>
                       <span>{selectedPrescription.patientAge || 'N/A'}</span>
                     </div>
                     <div className="detail-item">
                       <label>Gender:</label>
                       <span>{selectedPrescription.patientGender || 'N/A'}</span>
                     </div>
                   </div>
                 </div>
                 
                 {/* Doctor Information Card */}
                 <div className="detail-section doctor-card">
                   <div className="section-header">
                     <h4><FaUserInjured /> Doctor Information</h4>
                   </div>
                   <div className="detail-grid">
                     <div className="detail-item">
                       <label>Doctor Name:</label>
                       <span className="doctor-name">{selectedPrescription.doctorName}</span>
                     </div>
                     <div className="detail-item">
                       <label>Specialization:</label>
                       <span className="specialization">{selectedPrescription.doctorSpecialization}</span>
                     </div>
                   </div>
                 </div>
                 
                 {/* Prescription Information Card */}
                 <div className="detail-section prescription-card">
                   <div className="section-header">
                     <h4><FaFileAlt /> Prescription Information</h4>
                   </div>
                   <div className="detail-grid">
                     <div className="detail-item">
                       <label>Prescription ID:</label>
                       <span className="prescription-id">{selectedPrescription.prescriptionId}</span>
                     </div>
                     <div className="detail-item">
                       <label>Date:</label>
                       <span>{formatDate(selectedPrescription.prescriptionDate)}</span>
                     </div>
                     <div className="detail-item">
                       <label>Diagnosis:</label>
                       <span className="diagnosis">{selectedPrescription.diagnosis || 'N/A'}</span>
                     </div>
                     <div className="detail-item">
                       <label>Symptoms:</label>
                       <span>{selectedPrescription.symptoms || 'N/A'}</span>
                     </div>
                     <div className="detail-item">
                       <label>Priority:</label>
                       <span>{getPriorityBadge(selectedPrescription.priority)}</span>
                     </div>
                     <div className="detail-item">
                       <label>Notes:</label>
                       <span>{selectedPrescription.notes || 'N/A'}</span>
                     </div>
                   </div>
                 </div>
                 
                 {/* Lab Tests Section - Enhanced */}
                 <div className="detail-section lab-tests-card">
                   <div className="section-header">
                     <h4><FaFlask /> Prescribed Laboratory Tests</h4>
                     <div className="tests-summary">
                       {selectedPrescription.prescriptionItems && selectedPrescription.prescriptionItems.length > 0 ? (
                         <span className="tests-count">
                           {selectedPrescription.prescriptionItems.length} test(s) prescribed
                         </span>
                       ) : (
                         <span className="no-tests-count">No tests prescribed</span>
                       )}
                     </div>
                   </div>
                   
                   <div className="lab-tests-list">
                     {selectedPrescription.prescriptionItems && selectedPrescription.prescriptionItems.length > 0 ? (
                       <div className="tests-container">
                         <table className="tests-table">
                           <thead>
                             <tr>
                               <th>#</th>
                               <th>Test Name</th>
                               <th>Test Code</th>
                               <th>Category</th>
                               <th>Subcategory</th>
                               <th>Price</th>
                               <th>Description</th>
                             </tr>
                           </thead>
                           <tbody>
                             {selectedPrescription.prescriptionItems.map((item, index) => (
                               <tr key={index} className="test-row">
                                 <td className="test-number">{index + 1}</td>
                                 <td className="test-name">
                                   <strong>{item.testName}</strong>
                                 </td>
                                 <td className="test-code">
                                   <span className="code-badge">{item.testCode}</span>
                                 </td>
                                 <td className="test-category">
                                   <span className="category-badge">{item.category}</span>
                                 </td>
                                 <td className="test-subcategory">
                                   <span className="subcategory-badge">{item.subcategory || 'N/A'}</span>
                                 </td>
                                 <td className="test-price">
                                   <strong className="price">{formatCurrency(item.price)}</strong>
                                 </td>
                                 <td className="test-description">
                                   <span className="description">{item.description || 'N/A'}</span>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                           <tfoot>
                             <tr className="total-row">
                               <td colSpan="5"><strong>Total Amount:</strong></td>
                               <td className="total-price">
                                 <strong>{formatCurrency(selectedPrescription.prescriptionItems.reduce((sum, item) => sum + (item.price || 0), 0))}</strong>
                               </td>
                               <td></td>
                             </tr>
                           </tfoot>
                         </table>
                       </div>
                     ) : (
                       <div className="no-tests-container">
                         <div className="no-tests-icon">
                           <FaFlask />
                         </div>
                         <p className="no-tests">No laboratory tests have been prescribed for this patient.</p>
                         <p className="no-tests-subtitle">Please check the prescription or contact the doctor for clarification.</p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             </div>
             <div className="modal-footer">
               <button 
                 className="btn btn-secondary"
                 onClick={() => setSelectedPrescription(null)}
               >
                 <FaTimesCircle /> Close
               </button>
               {selectedPrescription.prescriptionItems && selectedPrescription.prescriptionItems.length > 0 && (
                 <button 
                   className="btn btn-primary"
                   onClick={() => {
                     setShowBillModal(true);
                   }}
                 >
                   <FaReceipt /> Generate Bill
                 </button>
               )}
             </div>
           </div>
         </div>
       )}

       {/* Payment Update Modal */}
       {showPaymentModal && selectedBill && (
         <div className="modal-overlay">
           <div className="modal">
             <div className="modal-header">
               <h3>Update Payment Status</h3>
               <button 
                 className="close-btn"
                 onClick={() => setShowPaymentModal(false)}
               >
                 <FaTimesCircle />
               </button>
             </div>
             <div className="modal-body">
               <div className="bill-summary">
                 <h4>Bill Details</h4>
                 <p><strong>Bill ID:</strong> {selectedBill.billId}</p>
                 <p><strong>Patient:</strong> {selectedBill.patientFirstName} {selectedBill.patientLastName}</p>
                 <p><strong>Amount:</strong> {formatCurrency(selectedBill.total)}</p>
                 <p><strong>Current Status:</strong> {getStatusBadge(selectedBill.paymentStatus)}</p>
               </div>
               
               <div className="payment-form">
                 <div className="form-group">
                   <label>Payment Status</label>
                   <select
                     value={paymentForm.paymentStatus}
                     onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentStatus: e.target.value }))}
                   >
                     <option value="pending">Pending</option>
                     <option value="partial">Partial</option>
                     <option value="paid">Paid</option>
                     <option value="cancelled">Cancelled</option>
                   </select>
                 </div>
                 <div className="form-group">
                   <label>Payment Method</label>
                   <select
                     value={paymentForm.paymentMethod}
                     onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                   >
                     <option value="cash">Cash</option>
                     <option value="card">Card</option>
                     <option value="upi">UPI</option>
                     <option value="netbanking">Net Banking</option>
                     <option value="cheque">Cheque</option>
                   </select>
                 </div>
                 <div className="form-group">
                   <label>Collected By</label>
                   <input
                     type="text"
                     value={paymentForm.collectedBy}
                     onChange={(e) => setPaymentForm(prev => ({ ...prev, collectedBy: e.target.value }))}
                   />
                 </div>
                 <div className="form-group">
                   <label>Notes</label>
                   <textarea
                     value={paymentForm.notes}
                     onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                     rows="3"
                   />
                 </div>
               </div>
             </div>
             <div className="modal-footer">
               <button 
                 className="btn btn-secondary"
                 onClick={() => setShowPaymentModal(false)}
               >
                 Cancel
               </button>
               <button 
                 className="btn btn-primary"
                 onClick={handleUpdatePayment}
               >
                 <FaCreditCard /> Update Payment
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default LabTestBilling;
