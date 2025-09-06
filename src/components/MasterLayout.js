import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  FaHospital,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaBell,
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaPills,
  FaCreditCard,
  FaBars,
  FaTimes,
  FaPrescriptionBottle,
  FaUserCog
} from 'react-icons/fa';
import '../styles/MasterTheme.css';

const MasterLayout = ({ children, title, subtitle, actions, showPatientSidebar = false, patientData = null }) => {
  const [userData, setUserData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserData(user);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: <FaHome />, section: 'main' },
    { path: '/add-patient', label: 'Add Patient', icon: <FaUsers />, section: 'patient' },
    { path: '/patients', label: 'Patients', icon: <FaUsers />, section: 'patient' },
    { path: '/appointments', label: 'Appointments', icon: <FaCalendarAlt />, section: 'clinical' },
    { path: '/doctor', label: 'Doctor Dashboard', icon: <FaFileAlt />, section: 'clinical' },
    { path: '/e-prescription', label: 'E-Prescription', icon: <FaFileAlt />, section: 'clinical' },
    { path: '/lab-tests', label: 'Lab Tests', icon: <FaPills />, section: 'lab' },
    { path: '/lab-billing', label: 'Lab Billing', icon: <FaCreditCard />, section: 'lab' },
    { path: '/billing', label: 'Billing', icon: <FaCreditCard />, section: 'lab' },
    { path: '/bills-view', label: 'Bills View', icon: <FaCreditCard />, section: 'lab' },
    { path: '/user-management', label: 'User Management', icon: <FaUserCog />, section: 'admin' },
    // Pharmacy Module Navigation
    { path: '/pharmacy', label: 'Pharmacy Dashboard', icon: <FaPrescriptionBottle />, section: 'pharmacy' },
    { path: '/pharmacy/pos', label: 'Pharmacy POS', icon: <FaCreditCard />, section: 'pharmacy' },
    { path: '/pharmacy/purchases', label: 'Purchases', icon: <FaFileAlt />, section: 'pharmacy' },
    { path: '/pharmacy/returns', label: 'Returns', icon: <FaFileAlt />, section: 'pharmacy' },
    { path: '/pharmacy/reports', label: 'Reports', icon: <FaFileAlt />, section: 'pharmacy' }
  ];

  const getSectionTitle = (section) => {
    const titles = {
      main: '', // Main Navigation caption removed
      patient: '',
      clinical: 'Clinical Operations',
      lab: 'Laboratory & Billing',
      pharmacy: 'Pharmacy Management',
      admin: 'Administration'
    };
    return titles[section] || section;
  };

  const groupedNavItems = navItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <div className="master-container">
              {/* Header - D"EMR Style */}
        <header className="master-header demr-header">
         <div className="header-left">
           {/* Mobile Menu Button */}
           <button 
             className="mobile-menu-btn"
             onClick={() => setSidebarOpen(!sidebarOpen)}
           >
             <FaBars />
           </button>
           
                      <div className="header-logo">
             <div className="header-logo-icon">
               <FaHospital />
             </div>
             <span>D"EMR</span>
           </div>
          
          <nav className="header-nav">
            {/* Header navigation removed as requested */}
          </nav>
        </div>
        
        <div className="header-right">
          <div className="header-search">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search patient" 
            />
          </div>
          
          <div className="header-actions">
            <div className="pharmacy-dropdown">
              <button className="header-btn" title="Pharmacy">
                <FaPrescriptionBottle />
              </button>
              <div className="pharmacy-dropdown-menu">
                <Link to="/pharmacy" className="dropdown-item">
                  <FaPrescriptionBottle /> Dashboard
                </Link>
                <Link to="/pharmacy/pos" className="dropdown-item">
                  <FaCreditCard /> POS
                </Link>
                <Link to="/pharmacy/purchases" className="dropdown-item">
                  <FaFileAlt /> Purchases
                </Link>
                <Link to="/pharmacy/returns" className="dropdown-item">
                  <FaFileAlt /> Returns
                </Link>
                <Link to="/pharmacy/reports" className="dropdown-item">
                  <FaFileAlt /> Reports
                </Link>
              </div>
            </div>
            <button className="header-btn" title="Grid View">
              <FaHome />
            </button>
            <button className="header-btn" title="Notifications">
              <FaBell />
            </button>
            <button className="header-btn" title="Settings">
              <FaCog />
            </button>
          </div>
          
          <div className="header-user">
            <div className="user-avatar">
              {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{userData.name || userData.username || 'Doctor'}</span>
              <span className="user-role">Medical Professional</span>
            </div>
            <button onClick={handleLogout} className="header-btn" title="Sign Out">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="master-main">
        {/* Mobile Sidebar Overlay */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? '' : 'hidden'}`}
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        {/* Left Sidebar - Navigation - STATIC */}
        <aside className={`master-sidebar ${!sidebarOpen ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            {/* Navigation title and toggle button removed as requested */}
          </div>
          
          <nav className="sidebar-nav">
            {Object.entries(groupedNavItems).map(([section, items]) => (
              <div key={section}>
                <div className="sidebar-section-title">
                  {getSectionTitle(section)}
                </div>
                {items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span className="sidebar-item-text">{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Content Area - All pages display here */}
        <main className="master-content">
          {/* Page Content - This is where all pages will render */}
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MasterLayout;
