import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaUserMd, 
  FaIdCardAlt, 
  FaPhone, 
  FaEnvelope, 
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
  FaSignInAlt
} from 'react-icons/fa';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    license: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isOffline, setIsOffline] = useState(false);

  // Check if we're in production (Vercel) and set offline mode
  useEffect(() => {
    if (window.location.hostname.includes('vercel.app')) {
      setIsOffline(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.specialization || !formData.license || 
        !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return false;
    }
    
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (isOffline) {
      // Demo mode - simulate successful registration
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Demo registration successful! Redirecting to login...' });
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Registration successful! Please login with your credentials.' }
          });
        }, 2000);
      }, 1500);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType: 'doctor'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setFormData({
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      license: 'MD12345',
      phone: '+91-9876543210',
      email: 'sarah.johnson@demo.com',
      password: 'demo123',
      confirmPassword: 'demo123'
    });
  };

  return (
    <div className="demr-register">
      {/* Background Pattern */}
      <div className="register-background">
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
          🔄 Demo Mode - Backend Offline. Registration will simulate success.
        </div>
      )}

      {/* Main Register Container */}
      <div className="register-container">
        {/* Left Side - Branding & Features */}
        <div className="register-left">
          <div className="brand-section">
            <div className="logo-container">
              <FaHospital className="logo-icon" />
              <h1 className="logo-title">D"EMR</h1>
            </div>
            <h2 className="brand-subtitle">#DontLosePatients</h2>
            <p className="brand-description">
              Join thousands of healthcare professionals using D"EMR for better patient care.
            </p>
          </div>
          
          <div className="features-list">
            <div className="feature-item">
              <FaUserMd className="feature-icon" />
              <div className="feature-content">
                <h3>Professional Registration</h3>
                <p>Get verified as a healthcare professional with our secure registration process</p>
              </div>
            </div>
            
            <div className="feature-item">
              <FaShieldAlt className="feature-icon" />
              <div className="feature-content">
                <h3>Secure & Compliant</h3>
                <p>HIPAA compliant platform with enterprise-grade security</p>
              </div>
            </div>
            
            <div className="feature-item">
              <FaStethoscope className="feature-icon" />
              <div className="feature-content">
                <h3>Complete EMR Solution</h3>
                <p>Everything you need to manage your practice efficiently</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="register-right">
          <div className="register-form-container">
            <div className="form-header">
              <div className="demr-logo">
                <div className="logo-icon-small">
                  <FaHospital />
                </div>
                <span className="logo-text-small">D"EMR</span>
              </div>
              <h2 className="form-title">REGISTER</h2>
              {isOffline && (
                <p style={{ 
                  fontSize: '12px', 
                  color: '#856404', 
                  margin: '5px 0 0 0',
                  textAlign: 'center'
                }}>
                  Demo Mode - Form will simulate successful registration
                </p>
              )}
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`message ${message.type}-message`}>
                {message.type === 'error' ? (
                  <FaExclamationTriangle className="message-icon" />
                ) : (
                  <FaCheckCircle className="message-icon" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="register-form">
              {/* Name Field */}
              <div className="form-group">
                <label className="form-label">
                  <FaUserMd className="label-icon" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Dr. Sarah Johnson"
                  disabled={loading}
                  required
                />
              </div>

              {/* Specialization Field */}
              <div className="form-group">
                <label className="form-label">
                  <FaStethoscope className="label-icon" />
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  className="form-input"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="Cardiology"
                  disabled={loading}
                  required
                />
              </div>

              {/* License Field */}
              <div className="form-group">
                <label className="form-label">
                  <FaIdCardAlt className="label-icon" />
                  Medical License Number *
                </label>
                <input
                  type="text"
                  name="license"
                  className="form-input"
                  value={formData.license}
                  onChange={handleInputChange}
                  placeholder="MD12345"
                  disabled={loading}
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label className="form-label">
                  <FaPhone className="label-icon" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91-9876543210"
                  disabled={loading}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">
                  <FaEnvelope className="label-icon" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="sarah.johnson@email.com"
                  disabled={loading}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">
                  <FaLock className="label-icon" />
                  Password *
                </label>
                <div className="input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="********"
                    disabled={loading}
                    required
                    minLength="6"
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

              {/* Confirm Password Field */}
              <div className="form-group">
                <label className="form-label">
                  <FaLock className="label-icon" />
                  Confirm Password *
                </label>
                <div className="input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="********"
                    disabled={loading}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Demo Fill Button */}
              {isOffline && (
                <button
                  type="button"
                  className="demo-fill-button"
                  onClick={handleDemoFill}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginBottom: '15px'
                  }}
                >
                  🎯 Fill Demo Data
                </button>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" />
                    Registering...
                  </>
                ) : (
                  <>
                    <FaUserPlus className="button-icon" />
                    {isOffline ? 'Demo Register' : 'Register'}
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="divider">
                <span>or</span>
              </div>

              {/* Login Link */}
              <div className="login-section">
                <p className="login-text">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="login-link"
                    onClick={() => navigate('/login')}
                    disabled={loading}
                  >
                    <FaSignInAlt className="link-icon" />
                    Login here
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

export default RegisterPage;
