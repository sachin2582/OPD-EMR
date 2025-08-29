import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUserMd, 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaHospital, 
  FaStethoscope,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaArrowRight,
  FaUserPlus,
  FaPills,
  FaUmbrella,
  FaGift,
  FaComments,
  FaCreditCard
} from 'react-icons/fa';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Check if we're in production (Vercel) and set offline mode
  useEffect(() => {
    if (window.location.hostname.includes('vercel.app')) {
      setIsOffline(true);
    }
  }, []);

  const redirectBasedOnUserType = useCallback((userType) => {
    switch (userType) {
      case 'doctor':
        navigate('/doctor');
        break;
      case 'admin':
        navigate('/dashboard');
        break;
      case 'billing':
        navigate('/billing');
        break;
      case 'reception':
        navigate('/patients');
        break;
      default:
        navigate('/dashboard');
    }
  }, [navigate]);

  const verifyToken = useCallback(async (token) => {
    if (isOffline) {
      // In demo mode, just redirect to dashboard
      redirectBasedOnUserType('admin');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userType = JSON.parse(atob(token.split('.')[1])).userType;
        redirectBasedOnUserType(userType);
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }, [redirectBasedOnUserType, isOffline]);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token is still valid
      verifyToken(token);
    }
  }, [verifyToken]);

  // Show success message if redirected from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      setTimeout(() => setSuccess(''), 5000);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username/Email is required');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    if (isOffline) {
      // Demo mode - simulate successful login
      setTimeout(() => {
        setSuccess('Demo login successful! Redirecting...');
        
        // Store demo user data
        const demoUser = {
          id: 1,
          username: formData.username,
          userType: 'admin',
          name: 'Demo User'
        };
        
        localStorage.setItem('authToken', 'demo-token-123');
        localStorage.setItem('userData', JSON.stringify(demoUser));
        
        // Redirect to dashboard
        setTimeout(() => {
          redirectBasedOnUserType('admin');
        }, 1000);
      }, 1000);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Login successful! Redirecting...');
        
        // Store token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Redirect based on user type
        setTimeout(() => {
          redirectBasedOnUserType(data.user.userType);
        }, 1000);
        
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setIsDemoMode(true);
    setFormData({
      username: 'demo@opd-emr.com',
      password: 'demo123'
    });
    setError('');
    setSuccess('');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    // For now, show a message. In production, implement password reset
    setError('Password reset functionality will be available soon. Please contact your administrator.');
  };

  return (
    <div className="demr-login">
      {/* Background Pattern */}
      <div className="login-background">
        <div className="pattern-overlay"></div>
      </div>

      {/* Demo Mode Banner */}
      {isOffline && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '10px',
          textAlign: 'center',
          borderBottom: '1px solid #ffeaa7',
          zIndex: 1000,
          fontSize: '14px'
        }}>
          🔄 Demo Mode - Backend Offline. Using sample data for demonstration.
        </div>
      )}

      {/* Main Login Container */}
      <div className="login-container">
        {/* Left Side - Branding & Features */}
        <div className="login-left">
          <div className="brand-section">
            <div className="logo-container">
              <FaHospital className="logo-icon" />
              <h1 className="logo-title">D"EMR</h1>
            </div>
            <h2 className="brand-subtitle">#DontLosePatients</h2>
            <p className="brand-description">
              The Third Wave is here. Setup your Online Consult profile now with D"EMR Toolkit.
            </p>
          </div>
          
          <div className="features-list">
            <div className="feature-item">
              <FaPills className="feature-icon" />
              <div className="feature-content">
                <h3>e-Rx in 14 Regional Languages</h3>
                <p>Prescribe in multiple regional languages for better patient understanding</p>
              </div>
            </div>
            
            <div className="feature-item">
              <FaUmbrella className="feature-icon" />
              <div className="feature-content">
                <h3>Free Medico-Legal Insurance</h3>
                <p>Comprehensive protection for medical professionals</p>
              </div>
            </div>
            
            <div className="feature-item">
              <FaGift className="feature-icon" />
              <div className="feature-content">
                <h3>Instant Payouts For Online Consultations</h3>
                <p>NEW: Get paid instantly for your online consultations</p>
              </div>
            </div>
            
            <div className="feature-item">
              <FaComments className="feature-icon" />
              <div className="feature-content">
                <h3>Engage with Patients Using Bulk SMS and WhatsApp Feature</h3>
                <p>Stay connected with patients through multiple communication channels</p>
              </div>
            </div>
            
            <div className="feature-item">
              <FaCreditCard className="feature-icon" />
              <div className="feature-content">
                <h3>Zero Commission on all Online Consultations</h3>
                <p>NEW: Keep 100% of your consultation fees</p>
              </div>
            </div>
          </div>
          
          <div className="support-contact">
            <p>Need help? Call us @1800 1020 127</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <div className="login-form-container">
            <div className="form-header">
              <div className="demr-logo">
                <div className="logo-icon-small">
                  <FaHospital />
                </div>
                <span className="logo-text-small">D"EMR</span>
              </div>
              <h2 className="form-title">SIGN IN</h2>
              {isOffline && (
                <p style={{ 
                  fontSize: '12px', 
                  color: '#856404', 
                  margin: '5px 0 0 0',
                  textAlign: 'center'
                }}>
                  Demo Mode - Any credentials will work
                </p>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="message error-message">
                <FaExclamationTriangle className="message-icon" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="message success-message">
                <FaCheckCircle className="message-icon" />
                <span>{success}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Username/Email Field */}
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-container">
                  <input
                    type="email"
                    name="username"
                    className="form-input"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder={isOffline ? "demo@opd-emr.com" : "arti@hplx.com"}
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={isOffline ? "demo123" : "********"}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="remember"
                    className="checkbox"
                    disabled={loading}
                  />
                  <label htmlFor="remember" className="checkbox-label">
                    Remember Me
                  </label>
                </div>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <FaArrowRight className="button-icon" />
                    {isOffline ? 'Demo Login' : 'Login'}
                  </>
                )}
              </button>

              {/* Demo Login */}
              <button
                type="button"
                className="demo-button"
                onClick={handleDemoLogin}
                disabled={loading || isDemoMode}
              >
                <FaStethoscope className="button-icon" />
                Try Demo Login
              </button>

              {/* Divider */}
              <div className="divider">
                <span>or</span>
              </div>

              {/* Register Link */}
              <div className="register-section">
                <p className="register-text">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="register-link"
                    onClick={handleRegister}
                    disabled={loading}
                  >
                    <FaUserPlus className="link-icon" />
                    Register here
                  </button>
                </p>
              </div>
            </form>
            
            {/* Copyright */}
            <div className="copyright">
              <p>D"EMR © 2014-21</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
