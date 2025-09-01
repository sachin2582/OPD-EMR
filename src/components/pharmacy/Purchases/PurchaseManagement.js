import React, { useState, useEffect } from 'react';
import { 
    FaPlus, FaSearch, FaFileInvoice, FaTruck, FaCheckCircle, 
    FaTimesCircle, FaEdit, FaTrash, FaEye, FaDownload, FaFilter,
    FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt
} from 'react-icons/fa';
import './PurchaseManagement.css';

const PurchaseManagement = () => {
    const [activeTab, setActiveTab] = useState('purchase-orders');
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [grnList, setGrnList] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreatePO, setShowCreatePO] = useState(false);
    const [showCreateGRN, setShowCreateGRN] = useState(false);
    const [showCreateSupplier, setShowCreateSupplier] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [selectedGRN, setSelectedGRN] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSupplier, setFilterSupplier] = useState('all');

    // Form states
    const [poForm, setPoForm] = useState({
        supplier_id: '',
        expected_delivery: '',
        notes: '',
        items: []
    });

    const [grnForm, setGrnForm] = useState({
        po_id: '',
        supplier_id: '',
        receipt_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: []
    });

    const [supplierForm, setSupplierForm] = useState({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        gst_number: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load purchase orders
            const poResponse = await fetch('/api/pharmacy/purchase-orders');
            if (poResponse.ok) {
                const poData = await poResponse.json();
                setPurchaseOrders(poData);
            }

            // Load GRN list
            const grnResponse = await fetch('/api/pharmacy/grn');
            if (grnResponse.ok) {
                const grnData = await grnResponse.json();
                setGrnList(grnData);
            }

            // Load suppliers
            const supplierResponse = await fetch('/api/pharmacy/suppliers');
            if (supplierResponse.ok) {
                const supplierData = await supplierResponse.json();
                setSuppliers(supplierData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePO = async () => {
        try {
            const response = await fetch('/api/pharmacy/purchase-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(poForm)
            });

            if (response.ok) {
                alert('Purchase Order created successfully!');
                setShowCreatePO(false);
                setPoForm({ supplier_id: '', expected_delivery: '', notes: '', items: [] });
                loadData();
            } else {
                alert('Error creating Purchase Order');
            }
        } catch (error) {
            console.error('Error creating PO:', error);
            alert('Error creating Purchase Order');
        }
    };

    const handleCreateGRN = async () => {
        try {
            const response = await fetch('/api/pharmacy/grn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(grnForm)
            });

            if (response.ok) {
                alert('GRN created successfully!');
                setShowCreateGRN(false);
                setGrnForm({ po_id: '', supplier_id: '', receipt_date: new Date().toISOString().split('T')[0], notes: '', items: [] });
                loadData();
            } else {
                alert('Error creating GRN');
            }
        } catch (error) {
            console.error('Error creating GRN:', error);
            alert('Error creating GRN');
        }
    };

    const handleCreateSupplier = async () => {
        try {
            const response = await fetch('/api/pharmacy/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplierForm)
            });

            if (response.ok) {
                alert('Supplier created successfully!');
                setShowCreateSupplier(false);
                setSupplierForm({ name: '', contact_person: '', email: '', phone: '', address: '', gst_number: '' });
                loadData();
            } else {
                alert('Error creating supplier');
            }
        } catch (error) {
            console.error('Error creating supplier:', error);
            alert('Error creating supplier');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'partial': return 'status-partial';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-pending';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <FaCheckCircle className="status-icon completed" />;
            case 'cancelled': return <FaTimesCircle className="status-icon cancelled" />;
            default: return <FaFileInvoice className="status-icon pending" />;
        }
    };

    const filteredPOs = purchaseOrders.filter(po => {
        const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             po.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
        const matchesSupplier = filterSupplier === 'all' || po.supplier_id.toString() === filterSupplier;
        
        return matchesSearch && matchesStatus && matchesSupplier;
    });

    const filteredGRNs = grnList.filter(grn => {
        const matchesSearch = grn.grn_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             grn.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSupplier = filterSupplier === 'all' || grn.supplier_id.toString() === filterSupplier;
        
        return matchesSearch && matchesSupplier;
    });

    return (
        <div className="purchase-management">
            {/* Header */}
            <div className="pm-header">
                <h1>🏥 Purchase Management</h1>
                <p>Manage purchase orders, GRN processing, and supplier relationships</p>
            </div>

            {/* Navigation Tabs */}
            <div className="pm-tabs">
                <button 
                    className={`tab ${activeTab === 'purchase-orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('purchase-orders')}
                >
                    <FaFileInvoice /> Purchase Orders
                </button>
                <button 
                    className={`tab ${activeTab === 'grn' ? 'active' : ''}`}
                    onClick={() => setActiveTab('grn')}
                >
                    <FaTruck /> GRN Processing
                </button>
                <button 
                    className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('suppliers')}
                >
                    <FaUser /> Suppliers
                </button>
            </div>

            {/* Purchase Orders Tab */}
            {activeTab === 'purchase-orders' && (
                <div className="tab-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2>Purchase Orders</h2>
                            <p>Manage and track purchase orders from suppliers</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-primary" onClick={() => setShowCreatePO(true)}>
                                <FaPlus /> Create PO
                            </button>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="filters-section">
                        <div className="search-box">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search PO number or supplier..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-controls">
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="partial">Partial</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)}>
                                <option value="all">All Suppliers</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Purchase Orders List */}
                    <div className="po-list">
                        {loading ? (
                            <div className="loading">Loading purchase orders...</div>
                        ) : filteredPOs.length > 0 ? (
                            filteredPOs.map(po => (
                                <div key={po.po_id} className="po-card">
                                    <div className="po-header">
                                        <div className="po-info">
                                            <h3>{po.po_number}</h3>
                                            <span className={`status ${getStatusColor(po.status)}`}>
                                                {getStatusIcon(po.status)} {po.status}
                                            </span>
                                        </div>
                                        <div className="po-actions">
                                            <button className="btn-icon" onClick={() => setSelectedPO(po)}>
                                                <FaEye />
                                            </button>
                                            <button className="btn-icon">
                                                <FaEdit />
                                            </button>
                                            <button className="btn-icon">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="po-details">
                                        <div className="detail-row">
                                            <span className="label">Supplier:</span>
                                            <span className="value">{po.supplier_name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Order Date:</span>
                                            <span className="value">{po.order_date}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Expected Delivery:</span>
                                            <span className="value">{po.expected_delivery || 'Not specified'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Total Amount:</span>
                                            <span className="value amount">₹{po.total_amount}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No purchase orders found</div>
                        )}
                    </div>
                </div>
            )}

            {/* GRN Tab */}
            {activeTab === 'grn' && (
                <div className="tab-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2>Goods Received Notes</h2>
                            <p>Process and track received goods from suppliers</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-primary" onClick={() => setShowCreateGRN(true)}>
                                <FaPlus /> Create GRN
                            </button>
                        </div>
                    </div>

                    {/* GRN List */}
                    <div className="grn-list">
                        {loading ? (
                            <div className="loading">Loading GRN list...</div>
                        ) : grnList.length > 0 ? (
                            grnList.map(grn => (
                                <div key={grn.grn_id} className="grn-card">
                                    <div className="grn-header">
                                        <div className="grn-info">
                                            <h3>{grn.grn_number}</h3>
                                            <span className="grn-date">{grn.receipt_date}</span>
                                        </div>
                                        <div className="grn-actions">
                                            <button className="btn-icon" onClick={() => setSelectedGRN(grn)}>
                                                <FaEye />
                                            </button>
                                            <button className="btn-icon">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grn-details">
                                        <div className="detail-row">
                                            <span className="label">Supplier:</span>
                                            <span className="value">{grn.supplier_name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">PO Reference:</span>
                                            <span className="value">{grn.po_number || 'Direct Receipt'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Total Amount:</span>
                                            <span className="value amount">₹{grn.total_amount}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No GRN records found</div>
                        )}
                    </div>
                </div>
            )}

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
                <div className="tab-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2>Suppliers</h2>
                            <p>Manage supplier information and relationships</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-primary" onClick={() => setShowCreateSupplier(true)}>
                                <FaPlus /> Add Supplier
                            </button>
                        </div>
                    </div>

                    {/* Suppliers List */}
                    <div className="suppliers-list">
                        {loading ? (
                            <div className="loading">Loading suppliers...</div>
                        ) : suppliers.length > 0 ? (
                            suppliers.map(supplier => (
                                <div key={supplier.supplier_id} className="supplier-card">
                                    <div className="supplier-header">
                                        <h3>{supplier.name}</h3>
                                        <div className="supplier-actions">
                                            <button className="btn-icon">
                                                <FaEdit />
                                            </button>
                                            <button className="btn-icon">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="supplier-details">
                                        <div className="contact-info">
                                            <div className="contact-item">
                                                <FaUser />
                                                <span>{supplier.contact_person}</span>
                                            </div>
                                            <div className="contact-item">
                                                <FaPhone />
                                                <span>{supplier.phone}</span>
                                            </div>
                                            <div className="contact-item">
                                                <FaEnvelope />
                                                <span>{supplier.email}</span>
                                            </div>
                                            {supplier.gst_number && (
                                                <div className="contact-item">
                                                    <FaFileInvoice />
                                                    <span>GST: {supplier.gst_number}</span>
                                                </div>
                                            )}
                                        </div>
                                        {supplier.address && (
                                            <div className="address">
                                                <FaMapMarkerAlt />
                                                <span>{supplier.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No suppliers found</div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Purchase Order Modal */}
            {showCreatePO && (
                <div className="modal-overlay" onClick={() => setShowCreatePO(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create Purchase Order</h3>
                            <button className="close-btn" onClick={() => setShowCreatePO(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Supplier</label>
                                <select 
                                    value={poForm.supplier_id} 
                                    onChange={(e) => setPoForm({...poForm, supplier_id: e.target.value})}
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Expected Delivery</label>
                                <input 
                                    type="date" 
                                    value={poForm.expected_delivery}
                                    onChange={(e) => setPoForm({...poForm, expected_delivery: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea 
                                    value={poForm.notes}
                                    onChange={(e) => setPoForm({...poForm, notes: e.target.value})}
                                    placeholder="Additional notes..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowCreatePO(false)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleCreatePO}>
                                    Create PO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create GRN Modal */}
            {showCreateGRN && (
                <div className="modal-overlay" onClick={() => setShowCreateGRN(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create GRN</h3>
                            <button className="close-btn" onClick={() => setShowCreateGRN(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Purchase Order (Optional)</label>
                                <select 
                                    value={grnForm.po_id} 
                                    onChange={(e) => setGrnForm({...grnForm, po_id: e.target.value})}
                                >
                                    <option value="">Direct Receipt</option>
                                    {purchaseOrders.filter(po => po.status !== 'completed').map(po => (
                                        <option key={po.po_id} value={po.po_id}>
                                            {po.po_number} - {po.supplier_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Supplier</label>
                                <select 
                                    value={grnForm.supplier_id} 
                                    onChange={(e) => setGrnForm({...grnForm, supplier_id: e.target.value})}
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Receipt Date</label>
                                <input 
                                    type="date" 
                                    value={grnForm.receipt_date}
                                    onChange={(e) => setGrnForm({...grnForm, receipt_date: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea 
                                    value={grnForm.notes}
                                    onChange={(e) => setGrnForm({...grnForm, notes: e.target.value})}
                                    placeholder="Receipt notes..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowCreateGRN(false)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleCreateGRN}>
                                    Create GRN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Supplier Modal */}
            {showCreateSupplier && (
                <div className="modal-overlay" onClick={() => setShowCreateSupplier(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Supplier</h3>
                            <button className="close-btn" onClick={() => setShowCreateSupplier(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Supplier Name</label>
                                <input 
                                    type="text" 
                                    value={supplierForm.name}
                                    onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                                    placeholder="Enter supplier name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input 
                                    type="text" 
                                    value={supplierForm.contact_person}
                                    onChange={(e) => setSupplierForm({...supplierForm, contact_person: e.target.value})}
                                    placeholder="Contact person name"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        value={supplierForm.email}
                                        onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
                                        placeholder="Email address"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input 
                                        type="tel" 
                                        value={supplierForm.phone}
                                        onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})}
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>GST Number</label>
                                <input 
                                    type="text" 
                                    value={supplierForm.gst_number}
                                    onChange={(e) => setSupplierForm({...supplierForm, gst_number: e.target.value})}
                                    placeholder="GST number (optional)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea 
                                    value={supplierForm.address}
                                    onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})}
                                    placeholder="Complete address"
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowCreateSupplier(false)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleCreateSupplier}>
                                    Add Supplier
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseManagement;
