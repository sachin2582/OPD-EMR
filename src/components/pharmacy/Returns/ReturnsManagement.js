import React, { useState, useEffect } from 'react';
import { 
    FaUndo, FaSearch, FaFileInvoice, FaTruck, FaCheckCircle, 
    FaTimesCircle, FaEdit, FaTrash, FaEye, FaDownload, FaFilter,
    FaCalendarAlt, FaUser, FaExclamationTriangle, FaArrowLeft,
    FaBoxes, FaReceipt, FaShieldAlt, FaClipboardList
} from 'react-icons/fa';
import './ReturnsManagement.css';

const ReturnsManagement = () => {
    const [activeTab, setActiveTab] = useState('sales-returns');
    const [salesReturns, setSalesReturns] = useState([]);
    const [supplierReturns, setSupplierReturns] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateSalesReturn, setShowCreateSalesReturn] = useState(false);
    const [showCreateSupplierReturn, setShowCreateSupplierReturn] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    // Form states
    const [salesReturnForm, setSalesReturnForm] = useState({
        original_invoice_id: '',
        return_date: new Date().toISOString().split('T')[0],
        reason: '',
        items: []
    });

    const [supplierReturnForm, setSupplierReturnForm] = useState({
        supplier_id: '',
        return_date: new Date().toISOString().split('T')[0],
        reason: '',
        items: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load sales returns
            const salesReturnResponse = await fetch('http://localhost:5000/api/pharmacy/returns/sales');
            if (salesReturnResponse.ok) {
                const salesReturnData = await salesReturnResponse.json();
                setSalesReturns(salesReturnData);
            }

            // Load supplier returns
            const supplierReturnResponse = await fetch('http://localhost:5000/api/pharmacy/returns/supplier');
            if (supplierReturnResponse.ok) {
                const supplierReturnData = await supplierReturnResponse.json();
                setSupplierReturns(supplierReturnData);
            }

            // Load invoices for reference
            const invoicesResponse = await fetch('http://localhost:5000/api/pharmacy/invoices');
            if (invoicesResponse.ok) {
                const invoicesData = await invoicesResponse.json();
                setInvoices(invoicesData);
            }

            // Load suppliers
            const suppliersResponse = await fetch('http://localhost:5000/api/pharmacy/suppliers');
            if (suppliersResponse.ok) {
                const suppliersData = await suppliersResponse.json();
                setSuppliers(suppliersData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSalesReturn = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/pharmacy/returns/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(salesReturnForm)
            });

            if (response.ok) {
                alert('Sales return created successfully!');
                setShowCreateSalesReturn(false);
                setSalesReturnForm({ original_invoice_id: '', return_date: new Date().toISOString().split('T')[0], reason: '', items: [] });
                loadData();
            } else {
                alert('Error creating sales return');
            }
        } catch (error) {
            console.error('Error creating sales return:', error);
            alert('Error creating sales return');
        }
    };

    const handleCreateSupplierReturn = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/pharmacy/returns/supplier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplierReturnForm)
            });

            if (response.ok) {
                alert('Supplier return created successfully!');
                setShowCreateSupplierReturn(false);
                setSupplierReturnForm({ supplier_id: '', return_date: new Date().toISOString().split('T')[0], reason: '', items: [] });
                loadData();
            } else {
                alert('Error creating supplier return');
            }
        } catch (error) {
            console.error('Error creating supplier return:', error);
            alert('Error creating supplier return');
        }
        };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'approved': return 'status-approved';
            case 'processed': return 'status-processed';
            case 'rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processed': return <FaCheckCircle className="status-icon processed" />;
            case 'rejected': return <FaTimesCircle className="status-icon rejected" />;
            case 'approved': return <FaShieldAlt className="status-icon approved" />;
            default: return <FaClipboardList className="status-icon pending" />;
        }
    };

    const getReturnTypeIcon = (type) => {
        switch (type) {
            case 'sales': return <FaReceipt />;
            case 'supplier': return <FaTruck />;
            default: return <FaUndo />;
        }
    };

    const filteredSalesReturns = salesReturns.filter(returnItem => {
        const matchesSearch = returnItem.return_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             returnItem.original_invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || returnItem.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const filteredSupplierReturns = supplierReturns.filter(returnItem => {
        const matchesSearch = returnItem.return_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             returnItem.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || returnItem.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const getOriginalInvoice = (invoiceId) => {
        return invoices.find(inv => inv.invoice_id === invoiceId);
    };

    return (
        <div className="returns-management">
            {/* Header */}
            <div className="rm-header">
                <h1>🔄 Returns Management</h1>
                <p>Process and track sales returns and supplier returns</p>
            </div>

            {/* Navigation Tabs */}
            <div className="rm-tabs">
                <button 
                    className={`tab ${activeTab === 'sales-returns' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales-returns')}
                >
                    <FaReceipt /> Sales Returns
                </button>
                <button 
                    className={`tab ${activeTab === 'supplier-returns' ? 'active' : ''}`}
                    onClick={() => setActiveTab('supplier-returns')}
                >
                    <FaTruck /> Supplier Returns
                </button>
                <button 
                    className={`tab ${activeTab === 'return-analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('return-analytics')}
                >
                    <FaClipboardList /> Analytics
                </button>
            </div>

            {/* Sales Returns Tab */}
            {activeTab === 'sales-returns' && (
                <div className="tab-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2>Sales Returns</h2>
                            <p>Process customer returns and refunds</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-primary" onClick={() => setShowCreateSalesReturn(true)}>
                                <FaUndo /> Create Return
                            </button>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="filters-section">
                        <div className="search-box">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search return number or invoice..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-controls">
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="processed">Processed</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Sales Returns List */}
                    <div className="returns-list">
                        {loading ? (
                            <div className="loading">Loading sales returns...</div>
                        ) : filteredSalesReturns.length > 0 ? (
                            filteredSalesReturns.map(returnItem => {
                                const originalInvoice = getOriginalInvoice(returnItem.original_invoice_id);
                                return (
                                    <div key={returnItem.return_id} className="return-card sales-return">
                                        <div className="return-header">
                                            <div className="return-info">
                                                <h3>{returnItem.return_number}</h3>
                                                <span className={`status ${getStatusColor(returnItem.status)}`}>
                                                    {getStatusIcon(returnItem.status)} {returnItem.status}
                                                </span>
                                            </div>
                                            <div className="return-actions">
                                                <button className="btn-icon" onClick={() => setSelectedReturn(returnItem)}>
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
                                        <div className="return-details">
                                            <div className="detail-row">
                                                <span className="label">Original Invoice:</span>
                                                <span className="value">{returnItem.original_invoice_number || 'N/A'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Return Date:</span>
                                                <span className="value">{returnItem.return_date}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Customer:</span>
                                                <span className="value">{originalInvoice?.patient_name || 'Walk-in Customer'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Total Amount:</span>
                                                <span className="value amount">₹{returnItem.total_amount}</span>
                                            </div>
                                        </div>
                                        {returnItem.reason && (
                                            <div className="return-reason">
                                                <strong>Reason:</strong> {returnItem.reason}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-data">No sales returns found</div>
                        )}
                    </div>
                </div>
            )}

            {/* Supplier Returns Tab */}
            {activeTab === 'supplier-returns' && (
                <div className="tab-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2>Supplier Returns</h2>
                            <p>Process returns to suppliers for damaged or expired items</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-primary" onClick={() => setShowCreateSupplierReturn(true)}>
                                <FaUndo /> Create Return
                            </button>
                        </div>
                    </div>

                    {/* Supplier Returns List */}
                    <div className="returns-list">
                        {loading ? (
                            <div className="loading">Loading supplier returns...</div>
                        ) : filteredSupplierReturns.length > 0 ? (
                            filteredSupplierReturns.map(returnItem => (
                                <div key={returnItem.return_id} className="return-card supplier-return">
                                    <div className="return-header">
                                        <div className="return-info">
                                            <h3>{returnItem.return_number}</h3>
                                            <span className={`status ${getStatusColor(returnItem.status)}`}>
                                                {getStatusIcon(returnItem.status)} {returnItem.status}
                                            </span>
                                        </div>
                                        <div className="return-actions">
                                            <button className="btn-icon" onClick={() => setSelectedReturn(returnItem)}>
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
                                    <div className="return-details">
                                        <div className="detail-row">
                                            <span className="label">Supplier:</span>
                                            <span className="value">{returnItem.supplier_name}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Return Date:</span>
                                            <span className="value">{returnItem.return_date}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Items Count:</span>
                                            <span className="value">{returnItem.items_count || 0}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Total Amount:</span>
                                            <span className="value amount">₹{returnItem.total_amount}</span>
                                        </div>
                                    </div>
                                    {returnItem.reason && (
                                        <div className="return-reason">
                                            <strong>Reason:</strong> {returnItem.reason}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-data">No supplier returns found</div>
                        )}
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'return-analytics' && (
                <div className="tab-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2>Return Analytics</h2>
                            <p>Analyze return patterns and trends</p>
                        </div>
                    </div>

                    {/* Analytics Dashboard */}
                    <div className="analytics-dashboard">
                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <div className="analytics-icon">
                                    <FaUndo />
                                </div>
                                <div className="analytics-content">
                                    <h3>Total Returns</h3>
                                    <p className="analytics-number">{salesReturns.length + supplierReturns.length}</p>
                                    <p className="analytics-label">All time</p>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="analytics-icon">
                                    <FaReceipt />
                                </div>
                                <div className="analytics-content">
                                    <h3>Sales Returns</h3>
                                    <p className="analytics-number">{salesReturns.length}</p>
                                    <p className="analytics-label">Customer returns</p>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="analytics-icon">
                                    <FaTruck />
                                </div>
                                <div className="analytics-content">
                                    <h3>Supplier Returns</h3>
                                    <p className="analytics-number">{supplierReturns.length}</p>
                                    <p className="analytics-label">To suppliers</p>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="analytics-icon">
                                    <FaExclamationTriangle />
                                </div>
                                <div className="analytics-content">
                                    <h3>Pending Returns</h3>
                                    <p className="analytics-number">
                                        {salesReturns.filter(r => r.status === 'pending').length + 
                                         supplierReturns.filter(r => r.status === 'pending').length}
                                    </p>
                                    <p className="analytics-label">Awaiting approval</p>
                                </div>
                            </div>
                        </div>

                        {/* Return Trends */}
                        <div className="trends-section">
                            <h3>Return Trends</h3>
                            <div className="trends-grid">
                                <div className="trend-item">
                                    <span className="trend-label">Most Common Reason</span>
                                    <span className="trend-value">Damaged Items</span>
                                </div>
                                <div className="trend-item">
                                    <span className="trend-label">Return Rate</span>
                                    <span className="trend-value">2.3%</span>
                                </div>
                                <div className="trend-item">
                                    <span className="trend-label">Avg Processing Time</span>
                                    <span className="trend-value">2.1 days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Sales Return Modal */}
            {showCreateSalesReturn && (
                <div className="modal-overlay" onClick={() => setShowCreateSalesReturn(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create Sales Return</h3>
                            <button className="close-btn" onClick={() => setShowCreateSalesReturn(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Original Invoice</label>
                                <select 
                                    value={salesReturnForm.original_invoice_id} 
                                    onChange={(e) => setSalesReturnForm({...salesReturnForm, original_invoice_id: e.target.value})}
                                >
                                    <option value="">Select Invoice</option>
                                    {invoices.map(invoice => (
                                        <option key={invoice.invoice_id} value={invoice.invoice_id}>
                                            {invoice.invoice_no} - {invoice.patient_name || 'Walk-in Customer'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Return Date</label>
                                <input 
                                    type="date" 
                                    value={salesReturnForm.return_date}
                                    onChange={(e) => setSalesReturnForm({...salesReturnForm, return_date: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Return Reason</label>
                                <select 
                                    value={salesReturnForm.reason}
                                    onChange={(e) => setSalesReturnForm({...salesReturnForm, reason: e.target.value})}
                                >
                                    <option value="">Select Reason</option>
                                    <option value="Damaged Item">Damaged Item</option>
                                    <option value="Wrong Item">Wrong Item</option>
                                    <option value="Expired Item">Expired Item</option>
                                    <option value="Customer Request">Customer Request</option>
                                    <option value="Quality Issue">Quality Issue</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowCreateSalesReturn(false)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleCreateSalesReturn}>
                                    Create Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Supplier Return Modal */}
            {showCreateSupplierReturn && (
                <div className="modal-overlay" onClick={() => setShowCreateSupplierReturn(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create Supplier Return</h3>
                            <button className="close-btn" onClick={() => setShowCreateSupplierReturn(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Supplier</label>
                                <select 
                                    value={supplierReturnForm.supplier_id} 
                                    onChange={(e) => setSupplierReturnForm({...supplierReturnForm, supplier_id: e.target.value})}
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
                                <label>Return Date</label>
                                <input 
                                    type="date" 
                                    value={supplierReturnForm.return_date}
                                    onChange={(e) => setSupplierReturnForm({...supplierReturnForm, return_date: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Return Reason</label>
                                <select 
                                    value={supplierReturnForm.reason}
                                    onChange={(e) => setSupplierReturnForm({...supplierReturnForm, reason: e.target.value})}
                                >
                                    <option value="">Select Reason</option>
                                    <option value="Damaged Items">Damaged Items</option>
                                    <option value="Expired Items">Expired Items</option>
                                    <option value="Wrong Items">Wrong Items</option>
                                    <option value="Quality Issues">Quality Issues</option>
                                    <option value="Overstock">Overstock</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowCreateSupplierReturn(false)}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={handleCreateSupplierReturn}>
                                    Create Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnsManagement;
