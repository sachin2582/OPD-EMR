import React, { useState, useEffect } from 'react';
import { FaPills, FaExclamationTriangle, FaCalendarAlt, FaDollarSign, FaPlus, FaSearch, FaBoxes, FaFileInvoice, FaUsers, FaChartBar } from 'react-icons/fa';
import './PharmacyDashboard.css';

const PharmacyDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        totalItems: 0,
        lowStockItems: 0,
        expiringItems: 0,
        totalValue: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/pharmacy/dashboard');
            if (response.ok) {
                const data = await response.json();
                setDashboardData(data);
            } else {
                throw new Error('Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Items',
            value: dashboardData.totalItems,
            icon: FaPills,
            color: 'blue',
            link: '/pharmacy/inventory'
        },
        {
            title: 'Low Stock Items',
            value: dashboardData.lowStockItems,
            icon: FaExclamationTriangle,
            color: 'red',
            link: '/pharmacy/reports/low-stock'
        },
        {
            title: 'Expiring Soon',
            value: dashboardData.expiringItems,
            icon: FaCalendarAlt,
            color: 'orange',
            link: '/pharmacy/reports/expiry'
        },
        {
            title: 'Total Value',
            value: `₹${dashboardData.totalValue.toLocaleString()}`,
            icon: FaDollarSign,
            color: 'green',
            link: '/pharmacy/reports/valuation'
        }
    ];

    const quickActions = [
        {
            title: 'Add New Item',
            icon: FaPlus,
            description: 'Add new medicine or medical supplies',
            link: '/pharmacy/inventory/add',
            color: 'blue'
        },
        {
            title: 'Quick Sale',
            icon: FaFileInvoice,
            description: 'Process walk-in sales or prescriptions',
            link: '/pharmacy/sales/quick',
            color: 'green'
        },
        {
            title: 'Receive Stock',
            icon: FaBoxes,
            description: 'Process GRN and add new batches',
            link: '/pharmacy/purchases/grn',
            color: 'purple'
        },
        {
            title: 'View Reports',
            icon: FaChartBar,
            description: 'Stock, sales, and financial reports',
            link: '/pharmacy/reports',
            color: 'indigo'
        }
    ];

    const navigationModules = [
        {
            title: 'Inventory Management',
            icon: FaPills,
            description: 'Manage items, batches, and stock levels',
            link: '/pharmacy/inventory',
            color: 'blue'
        },
        {
            title: 'Sales & Billing',
            icon: FaFileInvoice,
            description: 'Process sales, returns, and invoices',
            link: '/pharmacy/sales',
            color: 'green'
        },
        {
            title: 'Purchases & GRN',
            icon: FaBoxes,
            description: 'Manage suppliers, POs, and stock receipts',
            link: '/pharmacy/purchases',
            color: 'purple'
        },
        {
            title: 'Reports & Analytics',
            icon: FaChartBar,
            description: 'Comprehensive reports and insights',
            link: '/pharmacy/reports',
            color: 'indigo'
        },
        {
            title: 'User Management',
            icon: FaUsers,
            description: 'Manage roles and permissions',
            link: '/pharmacy/users',
            color: 'gray'
        }
    ];

    if (loading) {
        return (
            <div className="pharmacy-dashboard">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading Pharmacy Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pharmacy-dashboard">
                <div className="error-container">
                    <FaExclamationTriangle className="error-icon" />
                    <h3>Error Loading Dashboard</h3>
                    <p>{error}</p>
                    <button onClick={fetchDashboardData} className="retry-button">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pharmacy-dashboard">
            {/* Header */}
            <div className="pharmacy-header">
                <div className="header-content">
                    <h1>🏥 Pharmacy Management</h1>
                    <p>Complete inventory and sales management system</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">
                        <FaPlus /> New Transaction
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-section">
                <h2>Overview</h2>
                <div className="stats-grid">
                    {statCards.map((card, index) => (
                        <div key={index} className={`stat-card ${card.color}`}>
                            <div className="stat-icon">
                                <card.icon />
                            </div>
                            <div className="stat-content">
                                <h3>{card.title}</h3>
                                <div className="stat-value">{card.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions-grid">
                    {quickActions.map((action, index) => (
                        <div key={index} className={`quick-action-card ${action.color}`}>
                            <div className="action-icon">
                                <action.icon />
                            </div>
                            <div className="action-content">
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Navigation */}
            <div className="navigation-section">
                <h2>Pharmacy Modules</h2>
                <div className="navigation-grid">
                    {navigationModules.map((module, index) => (
                        <div key={index} className={`navigation-card ${module.color}`}>
                            <div className="module-icon">
                                <module.icon />
                            </div>
                            <div className="module-content">
                                <h3>{module.title}</h3>
                                <p>{module.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-section">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon">
                            <FaFileInvoice />
                        </div>
                        <div className="activity-content">
                            <h4>New prescription processed</h4>
                            <p>Patient: John Doe • Invoice: INV000001</p>
                            <span className="activity-time">2 minutes ago</span>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon">
                            <FaBoxes />
                        </div>
                        <div className="activity-content">
                            <h4>Stock received from ABC Pharma</h4>
                            <p>GRN: GRN000001 • Items: 5</p>
                            <span className="activity-time">1 hour ago</span>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon">
                            <FaExclamationTriangle />
                        </div>
                        <div className="activity-content">
                            <h4>Low stock alert</h4>
                            <p>Paracetamol 500mg below reorder level</p>
                            <span className="activity-time">3 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="alerts-section">
                <h2>Alerts & Notifications</h2>
                <div className="alerts-list">
                    {dashboardData.lowStockItems > 0 && (
                        <div className="alert-item warning">
                            <FaExclamationTriangle />
                            <span>{dashboardData.lowStockItems} items are below reorder level</span>
                        </div>
                    )}
                    {dashboardData.expiringItems > 0 && (
                        <div className="alert-item danger">
                            <FaCalendarAlt />
                            <span>{dashboardData.expiringItems} batches expiring within 30 days</span>
                        </div>
                    )}
                    {dashboardData.lowStockItems === 0 && dashboardData.expiringItems === 0 && (
                        <div className="alert-item success">
                            <FaPills />
                            <span>All systems operational - No urgent alerts</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboard;
