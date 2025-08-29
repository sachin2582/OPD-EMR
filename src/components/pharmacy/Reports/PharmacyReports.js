import React, { useState, useEffect } from 'react';
import { 
    FaChartBar, FaChartLine, FaChartPie, FaDownload, FaFilter,
    FaCalendarAlt, FaBoxes, FaMoneyBillWave, FaExclamationTriangle,
    FaArrowUp, FaArrowDown, FaEye, FaPrint, FaFileExcel, FaFilePdf,
    FaSearch, FaSort, FaFilter as FaFilterIcon
} from 'react-icons/fa';
import './PharmacyReports.css';

const PharmacyReports = () => {
    const [activeTab, setActiveTab] = useState('stock-reports');
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState({});
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        loadReportData();
    }, [activeTab, dateRange]);

    const loadReportData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'stock-reports':
                    endpoint = 'stock';
                    break;
                case 'sales-reports':
                    endpoint = 'sales';
                    break;
                case 'financial-reports':
                    endpoint = 'financial';
                    break;
                case 'expiry-reports':
                    endpoint = 'expiry';
                    break;
                default:
                    endpoint = 'stock';
            }

            const response = await fetch(`http://localhost:5000/api/pharmacy/reports/${endpoint}?start_date=${dateRange.start}&end_date=${dateRange.end}`);
            if (response.ok) {
                const data = await response.json();
                setReportData(data);
                setFilteredData(data.items || data.sales || data.financials || []);
            }
        } catch (error) {
            console.error('Error loading report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = (format) => {
        alert(`Exporting ${activeTab} in ${format} format...`);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    return (
        <div className="pharmacy-reports">
            {/* Header */}
            <div className="reports-header">
                <h1>📊 Pharmacy Reports</h1>
                <p>Comprehensive analytics and reporting for pharmacy operations</p>
            </div>

            {/* Navigation Tabs */}
            <div className="reports-tabs">
                <button 
                    className={`tab ${activeTab === 'stock-reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stock-reports')}
                >
                    <FaBoxes /> Stock Reports
                </button>
                <button 
                    className={`tab ${activeTab === 'sales-reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales-reports')}
                >
                    <FaChartBar /> Sales Reports
                </button>
                <button 
                    className={`tab ${activeTab === 'financial-reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('financial-reports')}
                >
                    <FaMoneyBillWave /> Financial Reports
                </button>
                <button 
                    className={`tab ${activeTab === 'expiry-reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expiry-reports')}
                >
                    <FaExclamationTriangle /> Expiry Reports
                </button>
            </div>

            {/* Date Range and Filters */}
            <div className="filters-section">
                <div className="date-filters">
                    <div className="date-input">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        />
                    </div>
                    <div className="date-input">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        />
                    </div>
                    <button className="btn-primary" onClick={loadReportData}>
                        <FaSearch /> Generate Report
                    </button>
                </div>
            </div>

            {/* Stock Reports Tab */}
            {activeTab === 'stock-reports' && (
                <div className="tab-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2>Stock Reports</h2>
                            <p>Current stock levels, valuations, and movement analysis</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-icon" onClick={() => exportReport('excel')}>
                                <FaFileExcel />
                            </button>
                            <button className="btn-icon" onClick={() => exportReport('pdf')}>
                                <FaFilePdf />
                            </button>
                            <button className="btn-icon" onClick={() => exportReport('print')}>
                                <FaPrint />
                            </button>
                        </div>
                    </div>

                    {/* Stock Summary Cards */}
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="card-icon">
                                <FaBoxes />
                            </div>
                            <div className="card-content">
                                <h3>Total Items</h3>
                                <p className="card-number">{reportData.totalItems || 0}</p>
                                <p className="card-label">In inventory</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaMoneyBillWave />
                            </div>
                            <div className="card-content">
                                <h3>Stock Value</h3>
                                <p className="card-number">{formatCurrency(reportData.totalValue)}</p>
                                <p className="card-label">Current value</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaExclamationTriangle />
                            </div>
                            <div className="card-content">
                                <h3>Low Stock Items</h3>
                                <p className="card-number">{reportData.lowStockItems || 0}</p>
                                <p className="card-label">Below reorder level</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaExclamationTriangle />
                            </div>
                            <div className="card-content">
                                <h3>Out of Stock</h3>
                                <p className="card-number">{reportData.outOfStockItems || 0}</p>
                                <p className="card-label">Zero stock</p>
                            </div>
                        </div>
                    </div>

                    {/* Stock Table */}
                    <div className="report-table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>SKU</th>
                                    <th>Current Stock</th>
                                    <th>Reorder Level</th>
                                    <th>Unit Price</th>
                                    <th>Total Value</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="loading">Loading stock data...</td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map(item => (
                                        <tr key={item.item_id}>
                                            <td>{item.name}</td>
                                            <td>{item.sku}</td>
                                            <td>{item.current_stock}</td>
                                            <td>{item.reorder_level}</td>
                                            <td>{formatCurrency(item.unit_price)}</td>
                                            <td>{formatCurrency(item.current_stock * item.unit_price)}</td>
                                            <td>
                                                <span className={`stock-status ${item.current_stock === 0 ? 'out-of-stock' : item.current_stock <= item.reorder_level ? 'low-stock' : 'normal-stock'}`}>
                                                    {item.current_stock === 0 ? 'Out of Stock' : 
                                                     item.current_stock <= item.reorder_level ? 'Low Stock' : 'Normal'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-icon">
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="no-data">No stock data found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Sales Reports Tab */}
            {activeTab === 'sales-reports' && (
                <div className="tab-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2>Sales Reports</h2>
                            <p>Sales performance, trends, and customer analysis</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-icon" onClick={() => exportReport('excel')}>
                                <FaFileExcel />
                            </button>
                            <button className="btn-icon" onClick={() => exportReport('pdf')}>
                                <FaFilePdf />
                            </button>
                            <button className="btn-icon" onClick={() => exportReport('print')}>
                                <FaPrint />
                            </button>
                        </div>
                    </div>

                    {/* Sales Summary Cards */}
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="card-icon">
                                <FaChartBar />
                            </div>
                            <div className="card-content">
                                <h3>Total Sales</h3>
                                <p className="card-number">{formatCurrency(reportData.totalSales)}</p>
                                <p className="card-label">Period total</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaChartLine />
                            </div>
                            <div className="card-content">
                                <h3>Total Orders</h3>
                                <p className="card-number">{reportData.totalOrders || 0}</p>
                                <p className="card-label">Number of orders</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaChartPie />
                            </div>
                            <div className="card-content">
                                <h3>Average Order Value</h3>
                                <p className="card-number">{formatCurrency(reportData.averageOrderValue)}</p>
                                <p className="card-label">Per order</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaArrowUp />
                            </div>
                            <div className="card-content">
                                <h3>Growth Rate</h3>
                                <p className="card-number">{((reportData.growthRate || 0) * 100).toFixed(1)}%</p>
                                <p className="card-label">vs previous period</p>
                            </div>
                        </div>
                    </div>

                    {/* Sales Chart Placeholder */}
                    <div className="chart-placeholder">
                        <h3>Sales Trend Chart</h3>
                        <p>Chart visualization would be implemented here</p>
                    </div>
                </div>
            )}

            {/* Financial Reports Tab */}
            {activeTab === 'financial-reports' && (
                <div className="tab-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2>Financial Reports</h2>
                            <p>Revenue, expenses, profit margins, and financial analysis</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-icon" onClick={() => exportReport('excel')}>
                                <FaFileExcel />
                            </button>
                            <button className="btn-icon" onClick={() => exportReport('pdf')}>
                                <FaFilePdf />
                            </button>
                            <button className="btn-icon" onClick={() => exportReport('print')}>
                                <FaPrint />
                            </button>
                        </div>
                    </div>

                    {/* Financial Summary Cards */}
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="card-icon">
                                <FaMoneyBillWave />
                            </div>
                            <div className="card-content">
                                <h3>Total Revenue</h3>
                                <p className="card-number">{formatCurrency(reportData.totalRevenue)}</p>
                                <p className="card-label">Period revenue</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaChartLine />
                            </div>
                            <div className="card-content">
                                <h3>Total Expenses</h3>
                                <p className="card-number">{formatCurrency(reportData.totalExpenses)}</p>
                                <p className="card-label">Period expenses</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaArrowUp />
                            </div>
                            <div className="card-content">
                                <h3>Net Profit</h3>
                                <p className="card-number">{formatCurrency(reportData.netProfit)}</p>
                                <p className="card-label">Revenue - Expenses</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaChartPie />
                            </div>
                            <div className="card-content">
                                <h3>Profit Margin</h3>
                                <p className="card-number">{((reportData.profitMargin || 0) * 100).toFixed(1)}%</p>
                                <p className="card-label">Profit percentage</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Expiry Reports Tab */}
            {activeTab === 'expiry-reports' && (
                <div className="tab-content">
                    <div className="content-header">
                        <div className="header-left">
                            <h2>Expiry Reports</h2>
                            <p>Track items nearing expiration and manage inventory</p>
                        </div>
                        <div className="header-actions">
                            <button className="btn-icon" onClick={() => exportReport('excel')}>
                                <FaFileExcel />
                            </button>
                            <button className="btn-icon" onClick={() => exportReport('pdf')}>
                                <FaFilePdf />
                            </button>
                            <button className="btn-icon" onClick={() => exportReport('print')}>
                                <FaPrint />
                            </button>
                        </div>
                    </div>

                    {/* Expiry Summary Cards */}
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="card-icon">
                                <FaExclamationTriangle />
                            </div>
                            <div className="card-content">
                                <h3>Expiring Soon</h3>
                                <p className="card-number">{reportData.expiringSoon || 0}</p>
                                <p className="card-label">Next 30 days</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaExclamationTriangle />
                            </div>
                            <div className="card-content">
                                <h3>Expired Items</h3>
                                <p className="card-number">{reportData.expiredItems || 0}</p>
                                <p className="card-label">Already expired</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaMoneyBillWave />
                            </div>
                            <div className="card-content">
                                <h3>Expiry Value</h3>
                                <p className="card-number">{formatCurrency(reportData.expiryValue)}</p>
                                <p className="card-label">At risk</p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-icon">
                                <FaChartLine />
                            </div>
                            <div className="card-content">
                                <h3>Expiry Rate</h3>
                                <p className="card-number">{((reportData.expiryRate || 0) * 100).toFixed(1)}%</p>
                                <p className="card-label">Of total inventory</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyReports;
