import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHospital, 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaPills,
  FaCreditCard,
  FaChartLine
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/advanced-dashboard', label: 'Advanced Dashboard', icon: <FaChartLine /> },
    { path: '/smart-appointments', label: 'Smart Scheduling', icon: <FaCalendarAlt /> },
    { path: '/add-patient', label: 'Add Patient', icon: <FaUsers /> },
    { path: '/patients', label: 'Patients', icon: <FaUsers /> },
    { path: '/appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
    { path: '/doctor', label: 'Doctor Dashboard', icon: <FaFileAlt /> },
    { path: '/billing', label: 'Billing', icon: <FaCreditCard /> },
    { path: '/lab-tests', label: 'Lab Tests', icon: <FaPills /> },
    { path: '/e-prescription', label: 'E-Prescription', icon: <FaFileAlt /> }
  ];

  if (!user) {
    return null;
  }

  return (
    <nav className="nav-modern">
      <div className="nav-modern-container">
        {/* Logo */}
        <Link to="/dashboard" className="nav-logo" onClick={closeMenus}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'var(--primary-600)'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'var(--gradient-primary)', 
              borderRadius: 'var(--radius-lg)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem'
            }}>
              <FaHospital />
            </div>
            <span style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--neutral-900)'
            }}>
              OPD-EMR
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-desktop-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
              onClick={closeMenus}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="nav-user-menu">
          <button
            className="nav-user-button"
            onClick={toggleUserMenu}
            aria-label="User menu"
          >
            <div style={{ 
              width: '36px', 
              height: '36px', 
              background: 'var(--gradient-primary)', 
              borderRadius: 'var(--radius-full)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="nav-user-name">{user.username || 'User'}</span>
            <div className={`nav-user-arrow ${isUserMenuOpen ? 'nav-user-arrow-open' : ''}`}>
              ▼
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="nav-user-dropdown">
              <div className="nav-user-info">
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'var(--gradient-primary)', 
                  borderRadius: 'var(--radius-full)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: 'var(--font-weight-semibold)'
                }}>
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="nav-user-fullname">{user.fullName || user.username}</div>
                  <div className="nav-user-role">{user.role || 'User'}</div>
                </div>
              </div>
              
              <div className="nav-user-actions">
                <Link to="/settings" className="nav-user-action" onClick={closeMenus}>
                  <FaCog />
                  <span>Settings</span>
                </Link>
                
                <button className="nav-user-action nav-user-action-danger" onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="nav-mobile-toggle"
          onClick={toggleMenu}
          aria-label="Toggle mobile menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="nav-mobile-menu">
          <div className="nav-mobile-header">
            <div className="nav-mobile-user">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--gradient-primary)', 
                borderRadius: 'var(--radius-full)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 'var(--font-weight-semibold)'
              }}>
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="nav-mobile-username">{user.fullName || user.username}</div>
                <div className="nav-mobile-role">{user.role || 'User'}</div>
              </div>
            </div>
          </div>
          
          <div className="nav-mobile-items">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-mobile-item ${isActive(item.path) ? 'nav-mobile-item-active' : ''}`}
                onClick={closeMenus}
              >
                <span className="nav-mobile-item-icon">{item.icon}</span>
                <span className="nav-mobile-item-label">{item.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="nav-mobile-actions">
            <Link to="/settings" className="nav-mobile-action" onClick={closeMenus}>
              <FaCog />
              <span>Settings</span>
            </Link>
            
            <button className="nav-mobile-action nav-mobile-action-danger" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
