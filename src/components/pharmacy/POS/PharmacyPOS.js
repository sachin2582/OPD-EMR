import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    FaBarcode, FaSearch, FaTrash, FaPrint, FaSave, FaPrescription, 
    FaCalculator, FaUser, FaCreditCard, FaMoneyBillWave, FaHistory,
    FaFileMedical, FaUserMd, FaCalendarAlt, FaPills, FaExclamationTriangle
} from 'react-icons/fa';
import api from '../../../config/api';
import './PharmacyPOS.css';

const PharmacyPOS = () => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [prescriptionMode, setPrescriptionMode] = useState(false);
    const [prescriptionId, setPrescriptionId] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [patients, setPatients] = useState([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [prescriptionSearch, setPrescriptionSearch] = useState('');
    const [patientHistory, setPatientHistory] = useState(null);
    const [prescriptionDetails, setPrescriptionDetails] = useState(null);
    const [stockWarnings, setStockWarnings] = useState([]);
    
    const barcodeInputRef = useRef(null);
    const searchInputRef = useRef(null);

    // Cart calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const taxAmount = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity * (item.tax_rate / 100)), 0);
    const total = subtotal + taxAmount;

    useEffect(() => {
        // Focus barcode input on component mount
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
        }
        
        // Load stock warnings
        loadStockWarnings();
    }, []);

    // Load stock warnings for low stock and near-expiry items
    const loadStockWarnings = async () => {
        try {
            const response = await api.get('/api/pharmacy/dashboard/warnings');
            if (response.ok) {
                const data = await response.json();
                setStockWarnings(data);
            }
        } catch (error) {
            console.error('Error loading stock warnings:', error);
        }
    };

    // Handle barcode input
    const handleBarcodeInput = async (e) => {
        const value = e.target.value;
        setBarcodeInput(value);
        
        if (value.length >= 8) { // Minimum barcode length
            await searchItems(value, 'barcode');
            setBarcodeInput('');
        }
    };

    // Search items by term and type
    const searchItems = async (term, type = 'search') => {
        if (!term.trim()) return;
        
        setLoading(true);
        try {
            let url = `/api/pharmacy/items?search=${encodeURIComponent(term)}`;
            if (type === 'barcode') {
                url = `/api/pharmacy/items?search=${encodeURIComponent(term)}`;
            }
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const availableItems = data.filter(item => item.current_stock > 0);
                
                // Add stock warnings for low stock items
                const itemsWithWarnings = availableItems.map(item => ({
                    ...item,
                    hasWarning: item.current_stock <= item.reorder_level || 
                               stockWarnings.some(w => w.item_id === item.item_id)
                }));
                
                setSearchResults(itemsWithWarnings);
            }
        } catch (error) {
            console.error('Error searching items:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add item to cart
    const addToCart = (item) => {
        const existingItem = cart.find(cartItem => cartItem.item_id === item.item_id);
        
        if (existingItem) {
            // Update quantity if item already in cart
            setCart(cart.map(cartItem => 
                cartItem.item_id === item.item_id 
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            // Add new item to cart
            setCart([...cart, {
                ...item,
                quantity: 1,
                cart_id: Date.now() // Unique ID for cart item
            }]);
        }
        
        setSearchResults([]);
        setSearchTerm('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    // Update cart item quantity
    const updateQuantity = (cartId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(cartId);
            return;
        }
        
        setCart(cart.map(item => 
            item.cart_id === cartId 
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    // Remove item from cart
    const removeFromCart = (cartId) => {
        setCart(cart.filter(item => item.cart_id !== cartId));
    };

    // Clear cart
    const clearCart = () => {
        setCart([]);
        setSelectedPatient(null);
        setPrescriptionId('');
        setPrescriptionMode(false);
        setPrescriptionDetails(null);
    };

    // Search patients
    const searchPatients = async (term) => {
        if (!term.trim()) return;
        
        try {
            const response = await api.get(`/api/patients?search=${encodeURIComponent(term)}`);
            if (response.ok) {
                const data = await response.json();
                setPatients(data);
            }
        } catch (error) {
            console.error('Error searching patients:', error);
        }
    };

    // Select patient
    const selectPatient = async (patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(false);
        setPatientSearch('');
        
        // Load patient history
        await loadPatientHistory(patient.id);
    };

    // Load patient history
    const loadPatientHistory = async (patientId) => {
        try {
            const response = await api.get(`/api/pharmacy/patients/${patientId}/history`);
            if (response.ok) {
                const data = await response.json();
                setPatientHistory(data);
            }
        } catch (error) {
            console.error('Error loading patient history:', error);
        }
    };

    // Search prescriptions
    const searchPrescriptions = async (term) => {
        if (!term.trim()) return;
        
        try {
            const response = await api.get(`/api/prescriptions?search=${encodeURIComponent(term)}`);
            if (response.ok) {
                const data = await response.json();
                setPrescriptions(data);
            }
        } catch (error) {
            console.error('Error searching prescriptions:', error);
        }
    };

    // Select prescription
    const selectPrescription = async (prescription) => {
        setPrescriptionId(prescription.id);
        setShowPrescriptionModal(false);
        setPrescriptionSearch('');
        
        // Load prescription details
        await loadPrescriptionDetails(prescription.id);
    };

    // Load prescription details
    const loadPrescriptionDetails = async (prescriptionId) => {
        try {
            const response = await api.get(`/api/prescriptions/${prescriptionId}`);
            if (response.ok) {
                const data = await response.json();
                setPrescriptionDetails(data);
                
                // Auto-fill cart with prescription items if available
                if (data.medications && data.medications.length > 0) {
                    await fillCartFromPrescription(data.medications);
                }
            }
        } catch (error) {
            console.error('Error loading prescription details:', error);
        }
    };

    // Fill cart from prescription
    const fillCartFromPrescription = async (medications) => {
        const prescriptionItems = [];
        
        for (const med of medications) {
            try {
                // Search for the medication in pharmacy inventory
                const response = await api.get(`/api/pharmacy/items?search=${encodeURIComponent(med.name)}`);
                if (response.ok) {
                    const items = await response.json();
                    const availableItem = items.find(item => 
                        item.current_stock > 0 && 
                        (item.name.toLowerCase().includes(med.name.toLowerCase()) ||
                         item.generic_name?.toLowerCase().includes(med.name.toLowerCase()))
                    );
                    
                    if (availableItem) {
                        prescriptionItems.push({
                            ...availableItem,
                            quantity: med.durationValue || 1,
                            cart_id: Date.now() + Math.random(),
                            fromPrescription: true,
                            prescriptionNote: med.instructions
                        });
                    }
                }
            } catch (error) {
                console.error('Error searching for medication:', med.name, error);
            }
        }
        
        if (prescriptionItems.length > 0) {
            setCart(prescriptionItems);
        }
    };

    // Process sale
    const processSale = async () => {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        if (prescriptionMode && !prescriptionId) {
            alert('Please enter prescription ID');
            return;
        }

        try {
            const saleData = {
                patient_id: selectedPatient?.id || null,
                prescription_id: prescriptionMode ? prescriptionId : null,
                items: cart.map(item => ({
                    item_id: item.item_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    tax_rate: item.tax_rate
                })),
                payment_method: paymentMethod,
                subtotal: subtotal,
                tax_amount: taxAmount,
                total_amount: total
            };

            const response = await api.post('/api/pharmacy/sales', saleData);

            if (response.ok) {
                const result = await response.json();
                alert(`Sale completed successfully! Invoice: ${result.invoice_no}`);
                clearCart();
                // Here you could trigger printing or show receipt
            } else {
                const error = await response.json();
                alert(`Sale failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Error processing sale:', error);
            alert('Error processing sale. Please try again.');
        }
    };

    // Handle prescription mode toggle
    const togglePrescriptionMode = () => {
        setPrescriptionMode(!prescriptionMode);
        if (!prescriptionMode) {
            setPrescriptionId('');
            setPrescriptionDetails(null);
        }
    };

    // Quick patient lookup by ID
    const quickPatientLookup = async (patientId) => {
        try {
            const response = await api.get(`/api/patients/${patientId}`);
            if (response.ok) {
                const patient = await response.json();
                setSelectedPatient(patient);
                await loadPatientHistory(patient.id);
            } else {
                alert('Patient not found');
            }
        } catch (error) {
            console.error('Error looking up patient:', error);
            alert('Error looking up patient');
        }
    };

    return (
        <div className="pharmacy-pos">
            {/* Header */}
            <div className="pos-header">
                <div className="header-left">
                    <h1>🏥 Pharmacy POS</h1>
                    <p>Point of Sale System - EMR Integrated</p>
                </div>
                <div className="header-right">
                    <div className="patient-info">
                        {selectedPatient ? (
                            <div className="selected-patient">
                                <FaUser />
                                <span>{selectedPatient.name}</span>
                                <button 
                                    className="clear-patient-btn"
                                    onClick={() => setSelectedPatient(null)}
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <button 
                                className="select-patient-btn"
                                onClick={() => setShowPatientModal(true)}
                            >
                                <FaUser /> Select Patient
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stock Warnings */}
            {stockWarnings.length > 0 && (
                <div className="stock-warnings">
                    <div className="warnings-header">
                        <FaExclamationTriangle />
                        <span>Stock Alerts</span>
                    </div>
                    <div className="warnings-list">
                        {stockWarnings.slice(0, 3).map(warning => (
                            <span key={warning.item_id} className="warning-item">
                                {warning.type === 'low_stock' ? 'Low Stock' : 'Near Expiry'}: {warning.item_name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="pos-container">
                {/* Left Panel - Item Search and Results */}
                <div className="pos-left-panel">
                    {/* Quick Patient Lookup */}
                    <div className="quick-lookup">
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                placeholder="Quick Patient ID lookup..."
                                onKeyPress={(e) => e.key === 'Enter' && quickPatientLookup(e.target.value)}
                                className="quick-lookup-input"
                            />
                        </div>
                    </div>

                    {/* Barcode Scanner */}
                    <div className="barcode-section">
                        <div className="input-group">
                            <FaBarcode className="input-icon" />
                            <input
                                ref={barcodeInputRef}
                                type="text"
                                placeholder="Scan barcode or enter manually..."
                                value={barcodeInput}
                                onChange={handleBarcodeInput}
                                className="barcode-input"
                            />
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="search-section">
                        <div className="input-group">
                            <FaSearch className="input-icon" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search items by name, SKU, or generic name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && searchItems(searchTerm)}
                                className="search-input"
                            />
                            <button 
                                className="search-btn"
                                onClick={() => searchItems(searchTerm)}
                                disabled={loading}
                            >
                                {loading ? '...' : 'Search'}
                            </button>
                        </div>
                    </div>

                    {/* Prescription Mode Toggle */}
                    <div className="prescription-toggle">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={prescriptionMode}
                                onChange={togglePrescriptionMode}
                            />
                            <span className="toggle-slider"></span>
                            <FaPrescription className="toggle-icon" />
                            Prescription Mode
                        </label>
                        {prescriptionMode && (
                            <div className="prescription-inputs">
                                <input
                                    type="text"
                                    placeholder="Enter Prescription ID"
                                    value={prescriptionId}
                                    onChange={(e) => setPrescriptionId(e.target.value)}
                                    className="prescription-input"
                                />
                                <button 
                                    className="lookup-prescription-btn"
                                    onClick={() => setShowPrescriptionModal(true)}
                                >
                                    <FaFileMedical /> Lookup
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Patient History Display */}
                    {selectedPatient && patientHistory && (
                        <div className="patient-history">
                            <h3><FaHistory /> Patient History</h3>
                            <div className="history-summary">
                                <div className="history-item">
                                    <span>Last Visit:</span>
                                    <span>{patientHistory.last_visit || 'N/A'}</span>
                                </div>
                                <div className="history-item">
                                    <span>Total Orders:</span>
                                    <span>{patientHistory.total_orders || 0}</span>
                                </div>
                                <div className="history-item">
                                    <span>Last Order:</span>
                                    <span>{patientHistory.last_order || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Prescription Details Display */}
                    {prescriptionDetails && (
                        <div className="prescription-details">
                            <h3><FaFileMedical /> Prescription Details</h3>
                            <div className="prescription-info">
                                <div className="prescription-item">
                                    <span>Date:</span>
                                    <span>{prescriptionDetails.date}</span>
                                </div>
                                <div className="prescription-item">
                                    <span>Doctor:</span>
                                    <span>{prescriptionDetails.doctor_name || 'N/A'}</span>
                                </div>
                                <div className="prescription-item">
                                    <span>Medications:</span>
                                    <span>{prescriptionDetails.medications?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    <div className="search-results">
                        <h3>Search Results</h3>
                        {searchResults.length > 0 ? (
                            <div className="results-grid">
                                {searchResults.map(item => (
                                    <div key={item.item_id} className={`result-item ${item.hasWarning ? 'has-warning' : ''}`}>
                                        <div className="item-info">
                                            <h4>{item.name}</h4>
                                            <p className="item-details">
                                                <span className="sku">SKU: {item.sku}</span>
                                                <span className="stock">Stock: {item.current_stock}</span>
                                                {item.hasWarning && (
                                                    <span className="warning-badge">
                                                        <FaExclamationTriangle />
                                                    </span>
                                                )}
                                            </p>
                                            <p className="item-price">₹{item.selling_price}</p>
                                            {item.generic_name && (
                                                <p className="generic-name">Generic: {item.generic_name}</p>
                                            )}
                                        </div>
                                        <div className="item-actions">
                                            <button className="add-to-cart-btn">
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results">
                                <p>No items found. Try searching for medicines or medical supplies.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Cart and Checkout */}
                <div className="pos-right-panel">
                    {/* Cart Header */}
                    <div className="cart-header">
                        <h2>Shopping Cart</h2>
                        <button className="clear-cart-btn" onClick={clearCart}>
                            <FaTrash /> Clear Cart
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <p>Cart is empty</p>
                                <p>Scan barcode or search for items to add</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.cart_id} className={`cart-item ${item.fromPrescription ? 'from-prescription' : ''}`}>
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <p className="item-sku">SKU: {item.sku}</p>
                                        <p className="item-price">₹{item.unit_price}</p>
                                        {item.fromPrescription && (
                                            <p className="prescription-note">
                                                <FaPrescription /> {item.prescriptionNote}
                                            </p>
                                        )}
                                    </div>
                                    <div className="item-quantity">
                                        <button 
                                            onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                                            className="qty-btn"
                                        >
                                            -
                                        </button>
                                        <span className="qty-display">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                                            className="qty-btn"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="item-total">
                                        ₹{(item.unit_price * item.quantity).toFixed(2)}
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.cart_id)}
                                        className="remove-item-btn"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Cart Summary */}
                    <div className="cart-summary">
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax:</span>
                            <span>₹{taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="payment-section">
                        <h3>Payment Method</h3>
                        <div className="payment-options">
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cash"
                                    checked={paymentMethod === 'cash'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <FaMoneyBillWave />
                                Cash
                            </label>
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <FaCreditCard />
                                Card
                            </label>
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="online"
                                    checked={paymentMethod === 'online'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <FaCreditCard />
                                Online
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button 
                            className="process-sale-btn"
                            onClick={processSale}
                            disabled={cart.length === 0}
                        >
                            <FaCalculator /> Process Sale
                        </button>
                        <button className="print-receipt-btn" disabled={cart.length === 0}>
                            <FaPrint /> Print Receipt
                        </button>
                        <button className="save-draft-btn" disabled={cart.length === 0}>
                            <FaSave /> Save Draft
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Selection Modal */}
            {showPatientModal && (
                <div className="modal-overlay" onClick={() => setShowPatientModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Select Patient</h3>
                            <button 
                                className="close-modal-btn"
                                onClick={() => setShowPatientModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="patient-search">
                                <input
                                    type="text"
                                    placeholder="Search patients by name or ID..."
                                    value={patientSearch}
                                    onChange={(e) => {
                                        setPatientSearch(e.target.value);
                                        searchPatients(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="patient-list">
                                {patients.map(patient => (
                                    <div 
                                        key={patient.id} 
                                        className="patient-item"
                                        onClick={() => selectPatient(patient)}
                                    >
                                        <div className="patient-info">
                                            <h4>{patient.name}</h4>
                                            <p>ID: {patient.id}</p>
                                            <p>Age: {patient.age || 'N/A'}</p>
                                            <p>Phone: {patient.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Prescription Selection Modal */}
            {showPrescriptionModal && (
                <div className="modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Select Prescription</h3>
                            <button 
                                className="close-modal-btn"
                                onClick={() => setShowPrescriptionModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="prescription-search">
                                <input
                                    type="text"
                                    placeholder="Search prescriptions by ID or patient name..."
                                    value={prescriptionSearch}
                                    onChange={(e) => {
                                        setPrescriptionSearch(e.target.value);
                                        searchPrescriptions(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="prescription-list">
                                {prescriptions.map(prescription => (
                                    <div 
                                        key={prescription.id} 
                                        className="prescription-item"
                                        onClick={() => selectPrescription(prescription)}
                                    >
                                        <div className="prescription-info">
                                            <h4>Prescription #{prescription.id}</h4>
                                            <p>Patient: {prescription.patient_name || 'N/A'}</p>
                                            <p>Date: {prescription.date || 'N/A'}</p>
                                            <p>Doctor: {prescription.doctor_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyPOS;
