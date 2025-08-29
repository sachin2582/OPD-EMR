import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  FaUser, 
  FaCalculator, 
  FaPrint, 
  FaDownload, 
  FaArrowLeft, 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaReceipt, 
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
  FaTimes
} from 'react-icons/fa';
import './Billing.css';

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(18); // 18% GST
  const [notes, setNotes] = useState('');
  const [userData, setUserData] = useState({});

  // Lab tests from database
  const [labTestsFromDB, setLabTestsFromDB] = useState([]);
  const [labTestsLoading, setLabTestsLoading] = useState(false);
  const [labTestsError, setLabTestsError] = useState(null);

  // Available services with pricing (non-lab services)
  const availableServices = [
    { id: 1, name: 'Consultation Fee', category: 'Consultation', price: 500, description: 'General consultation with doctor' },
    { id: 2, name: 'Specialist Consultation', category: 'Consultation', price: 1000, description: 'Specialist doctor consultation' },
    { id: 5, name: 'X-Ray', category: 'Radiology', price: 1200, description: 'Chest X-Ray examination' },
    { id: 6, name: 'ECG', category: 'Cardiology', price: 600, description: 'Electrocardiogram test' },
    { id: 7, name: 'Ultrasound', category: 'Radiology', price: 1500, description: 'Abdominal ultrasound' },
    { id: 8, name: 'Dressing', category: 'Treatment', price: 200, description: 'Wound dressing and care' },
    { id: 9, name: 'Injection', category: 'Treatment', price: 150, description: 'Intramuscular injection' },
    { id: 10, name: 'Medicine Supply', category: 'Pharmacy', price: 400, description: 'Prescribed medicines' }
  ];

  // Function to fetch lab tests from database
  const fetchLabTests = async () => {
    try {
      setLabTestsLoading(true);
      setLabTestsError(null);
      
      const response = await fetch('/api/lab-tests/all');
      
      if (response.ok) {
        const data = await response.json();
        setLabTestsFromDB(data.tests || []);
      } else {
        setLabTestsError('Failed to load lab tests');
      }
    } catch (error) {
      setLabTestsError('Failed to load lab tests');
    } finally {
      setLabTestsLoading(false);
    }
  };

  useEffect(() => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserData(user);
    }

    // Always initialize bill metadata
    setBillNumber(`BILL-${Date.now().toString().slice(-6)}`);
    setBillDate(new Date().toISOString().split('T')[0]);

    // If navigated here with a selected patient, prefill
    if (location.state?.patientData) {
      setPatientData(location.state.patientData);
      setPatientId(location.state.patientId?.toString() || '');
    }

    // Fetch lab tests from database
    fetchLabTests();
  }, [location.state]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchPatientByRegistrationNo = async () => {
    setLookupError('');
    setPatientData(null);

    const trimmed = (patientId || '').toString().trim();
    if (!trimmed) {
      setLookupError('Please enter a registration number.');
      return;
    }

    try {
      const res = await fetch(`/api/patients/${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setPatientData(data);
      } else if (res.status === 404) {
        setLookupError('No patient found with this registration number.');
      } else {
        const err = await res.json().catch(() => ({}));
        setLookupError(err?.error || 'Failed to fetch patient.');
      }
    } catch (e) {
      setLookupError('Failed to connect to server. Please ensure backend is running.');
    }
  };

  const addService = (service) => {
    const existingService = selectedServices.find(s => s.id === service.id);
    if (existingService) {
      setSelectedServices(selectedServices.map(s => 
        s.id === service.id 
          ? { ...s, quantity: s.quantity + 1, total: (s.quantity + 1) * s.price }
          : s
      ));
    } else {
      setSelectedServices([...selectedServices, { ...service, quantity: 1, total: service.price }]);
    }
  };

  const updateQuantity = (serviceId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
    } else {
      setSelectedServices(selectedServices.map(s => 
        s.id === serviceId 
          ? { ...s, quantity: newQuantity, total: newQuantity * s.price }
          : s
      ));
    }
  };

  const removeService = (serviceId) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const calculateSubtotal = () => {
    return selectedServices.reduce((sum, service) => sum + service.total, 0);
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTaxAmount = () => {
    const taxableAmount = calculateSubtotal() - calculateDiscountAmount();
    return (taxableAmount * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount() + calculateTaxAmount();
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-bill').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        ${printContent}
      </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleSaveBill = () => {
    const billData = {
      billNumber,
      billDate,
      patientData,
      patientId,
      selectedServices,
      subtotal: calculateSubtotal(),
      discount,
      discountAmount: calculateDiscountAmount(),
      taxRate,
      taxAmount: calculateTaxAmount(),
      total: calculateTotal(),
      paymentMethod,
      notes
    };
    
    // TODO: Replace with backend API call
    // const savedBills = JSON.parse(localStorage.getItem('bills') || '[]');
    // savedBills.push(billData);
    // localStorage.setItem('bills', JSON.stringify(savedBills));
    
    alert('Bill saved successfully!');
  };

  return (
          <div className="demr-billing">
      {/* Main Content */}
      <div className="billing-main">
        {/* Main Content Area */}
        <main className="main-content">
          {/* Header Section */}
          <div className="billing-header">
            <div className="header-left">
              <Link to="/dashboard" className="back-button">
                <FaArrowLeft />
                <span>Back to Dashboard</span>
              </Link>
              {patientData && (
                <p className="patient-info">
                  Generating bill for <strong>{patientData.firstName} {patientData.lastName}</strong>
                </p>
              )}
            </div>
            
            {/* Close Button */}
            <button 
              onClick={() => navigate('/dashboard')} 
              className="close-button"
              title="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* Patient Lookup Section */}
          <div className="billing-section">
            <div className="section-header">
              <FaUser className="section-icon" />
              <div>
                <h2>Patient Lookup</h2>
                <p>Enter registration number to load patient details</p>
              </div>
            </div>
            
            <div className="lookup-form">
              <div className="input-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Registration No (e.g., 1, 2, 3)"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
                <button className="btn-primary" onClick={fetchPatientByRegistrationNo}>
                  <FaSearch />
                  <span>Load Patient</span>
                </button>
              </div>
              
              {lookupError && (
                <div className="error-message">
                  <span>{lookupError}</span>
                </div>
              )}
              
              {patientData && (
                <div className="patient-details">
                  {location.state?.patientData && (
                    <div className="success-message">
                      ✅ Patient registered successfully! Ready to create bill.
                    </div>
                  )}
                  <div className="patient-info-grid">
                    <div className="info-item">
                      <span className="label">Patient:</span>
                      <span className="value">{patientData.firstName} {patientData.middleName} {patientData.lastName}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Reg No:</span>
                      <span className="value">#{patientData.patientId || patientId}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phone:</span>
                      <span className="value">{patientData.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {patientData && (
            <div className="billing-content">
              {/* Left Column - Service Selection */}
              <div className="billing-left">
                {/* Bill Information */}
                <div className="billing-section">
                  <div className="section-header">
                    <FaReceipt className="section-icon" />
                    <div>
                      <h2>Bill Information</h2>
                      <p>Configure bill details and payment method</p>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Bill Number</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={billNumber} 
                        onChange={(e) => setBillNumber(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Bill Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={billDate} 
                        onChange={(e) => setBillDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Payment Method</label>
                      <select 
                        className="form-input" 
                        value={paymentMethod} 
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="insurance">Insurance</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Available Services */}
                <div className="billing-section">
                  <div className="section-header">
                    <FaPlus className="section-icon" />
                    <div>
                      <h2>Available Services</h2>
                      <p>Click on services to add to bill</p>
                    </div>
                  </div>
                  
                  <div className="services-grid">
                    {/* Regular services */}
                    {availableServices.map(service => (
                      <div 
                        key={service.id} 
                        className="service-card"
                        onClick={() => addService(service)}
                      >
                        <div className="service-header">
                          <h4>{service.name}</h4>
                          <span className="service-price">₹{service.price}</span>
                        </div>
                        <p className="service-description">{service.description}</p>
                        <div className="service-category">{service.category}</div>
                      </div>
                    ))}
                    
                    {/* Lab tests from database */}
                    {labTestsLoading ? (
                      <div className="service-card loading">
                        <div className="service-header">
                          <h4>Loading Lab Tests...</h4>
                        </div>
                        <p className="service-description">Please wait while we load lab tests from database</p>
                      </div>
                    ) : labTestsError ? (
                      <div className="service-card error">
                        <div className="service-header">
                          <h4>Error Loading Lab Tests</h4>
                        </div>
                        <p className="service-description">{labTestsError}</p>
                      </div>
                    ) : (
                      labTestsFromDB.map(test => (
                        <div 
                          key={`lab-${test.id}`} 
                          className="service-card lab-test"
                          onClick={() => addService({
                            id: `lab-${test.id}`,
                            name: test.test_name,
                            category: 'Laboratory',
                            price: test.price || 500, // Default price if not set
                            description: test.description || `${test.test_name} laboratory test`,
                            isLabTest: true,
                            labTestId: test.id
                          })}
                        >
                          <div className="service-header">
                            <h4>{test.test_name}</h4>
                            <span className="service-price">₹{test.price || 500}</span>
                          </div>
                          <p className="service-description">{test.description || `${test.test_name} laboratory test`}</p>
                          <div className="service-category">Laboratory</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bill Notes */}
                <div className="billing-section">
                  <div className="section-header">
                    <FaNotesMedical className="section-icon" />
                    <div>
                      <h2>Additional Notes</h2>
                      <p>Enter any additional notes or instructions</p>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <textarea 
                      className="form-input" 
                      rows="4" 
                      placeholder="Enter any additional notes or instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Bill Summary */}
              <div className="billing-right">
                <div className="bill-summary">
                  <div className="summary-header">
                    <FaCalculator className="summary-icon" />
                    <div>
                      <h2>Bill Summary</h2>
                      <p>Review selected services and totals</p>
                    </div>
                  </div>
                  
                  {/* Selected Services */}
                  <div className="selected-services">
                    <h4>Selected Services</h4>
                    {selectedServices.length === 0 ? (
                      <div className="empty-state">
                        <p>No services selected</p>
                      </div>
                    ) : (
                      <div className="services-list">
                        {selectedServices.map(service => (
                          <div key={service.id} className="service-item">
                            <div className="service-details">
                              <div className="service-name">{service.name}</div>
                              <div className="service-price-info">₹{service.price} × {service.quantity}</div>
                            </div>
                            <div className="service-controls">
                              <button 
                                className="quantity-btn" 
                                onClick={() => updateQuantity(service.id, service.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="quantity">{service.quantity}</span>
                              <button 
                                className="quantity-btn" 
                                onClick={() => updateQuantity(service.id, service.quantity + 1)}
                              >
                                +
                              </button>
                              <button 
                                className="remove-btn" 
                                onClick={() => removeService(service.id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bill Calculations */}
                  <div className="bill-calculations">
                    <div className="calculation-row">
                      <span>Subtotal:</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="calculation-row">
                      <span>Discount ({discount}%):</span>
                      <span>-₹{calculateDiscountAmount().toFixed(2)}</span>
                    </div>
                    
                    <div className="calculation-row">
                      <span>Tax (GST {taxRate}%):</span>
                      <span>₹{calculateTaxAmount().toFixed(2)}</span>
                    </div>
                    
                    <div className="calculation-row total">
                      <span>Total:</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Discount Control */}
                  <div className="discount-control">
                    <label>Discount Percentage</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0" 
                      max="100" 
                      value={discount} 
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button 
                      className="btn-primary full-width" 
                      onClick={handlePrint}
                      disabled={selectedServices.length === 0}
                    >
                      <FaPrint />
                      <span>Generate & Print Bill</span>
                    </button>
                    <button 
                      className="btn-secondary full-width" 
                      onClick={handleSaveBill}
                      disabled={selectedServices.length === 0}
                    >
                      <FaSave />
                      <span>Save Bill</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Printable Bill (Hidden) */}
          {patientData && (
            <div id="printable-bill" style={{ display: 'none' }}>
              <div style={{ 
                fontFamily: 'Arial, sans-serif', 
                maxWidth: '800px', 
                margin: '0 auto', 
                padding: '20px',
                border: '2px solid #333'
              }}>
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '3px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
                  <h1 style={{ margin: 0, color: '#333', fontSize: '28px' }}>D"EMR Hospital</h1>
                  <p style={{ margin: '5px 0', fontSize: '16px' }}>Patient Billing Statement</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>123 Healthcare Street, Medical City, MC 12345</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>Phone: +1-555-0123 | Email: billing@demr.com</p>
                </div>

                {/* Bill Information */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Bill To:</h3>
                    <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>
                      {patientData.firstName} {patientData.middleName} {patientData.lastName}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>Patient ID: #{patientData.patientId || patientId}</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>Phone: {patientData.phone}</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>Address: {patientData.address}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Bill Details:</h3>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>Bill #: {billNumber}</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>Date: {new Date(billDate).toLocaleDateString()}</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>Payment: {paymentMethod.toUpperCase()}</p>
                  </div>
                </div>

                {/* Services Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Service</th>
                      <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>Qty</th>
                      <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>Rate</th>
                      <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedServices.map(service => (
                      <tr key={service.id}>
                        <td style={{ border: '1px solid #ddd', padding: '12px' }}>{service.name}</td>
                        <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>{service.quantity}</td>
                        <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>₹{service.price}</td>
                        <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right' }}>₹{service.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ textAlign: 'right', marginBottom: '30px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '20px' }}>Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '20px' }}>Discount ({discount}%):</span>
                    <span>-₹{calculateDiscountAmount().toFixed(2)}</span>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '20px' }}>Tax (GST {taxRate}%):</span>
                    <span>₹{calculateTaxAmount().toFixed(2)}</span>
                  </div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    borderTop: '2px solid #333', 
                    paddingTop: '10px',
                    color: '#333'
                  }}>
                    <span style={{ marginRight: '20px' }}>Total Amount:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Notes:</h4>
                    <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic' }}>{notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div style={{ 
                  borderTop: '2px solid #333', 
                  paddingTop: '20px', 
                  textAlign: 'center',
                  marginTop: '40px'
                }}>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>Thank you for choosing D"EMR Hospital</p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>This is a computer generated bill</p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>Generated on: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Billing;
