import React, { useState } from 'react';
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

  const handleLogin = () => {
    navigate('/login');
  };

  return (
          <div className="demr-register">
      <div className="register-background">
        <div className="pattern-overlay"></div>
      </div>
      
      <div className="register-container">
        {/* Left Side - Branding & Features */}
        <div className="register-left">
          <div className="brand-section">
            <div className="logo-container">
              <FaHospital className="logo-icon" />
              <h1 className="logo-title">D"EMR</h1>
            </div>
            <h2 className="brand-subtitle">Professional Healthcare</h2>
            <p className="brand-description">
              Streamline your medical practice
            </p>
          </div>
          
          <div className="features-list">
            <div className="feature-item">
              <FaStethoscope className="feature-icon" />
              <div className="feature-content">
                <h3>Clinical Tools</h3>
                <p>Advanced patient care</p>
              </div>
            </div>
            <div className="feature-item">
              <FaShieldAlt className="feature-icon" />
              <div className="feature-content">
                <h3>Secure & Compliant</h3>
                <p>HIPAA compliant</p>
              </div>
            </div>
            <div className="feature-item">
              <FaUserMd className="feature-icon" />
              <div className="feature-content">
                <h3>Doctor-Friendly</h3>
                <p>Intuitive interface</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Registration Form */}
        <div className="register-right">
          <div className="register-form-container">
            <div className="form-header">
              <h2 className="form-title">
                <FaUserPlus className="form-icon" />
                Doctor Registration
              </h2>
              <p className="form-subtitle">
                Join our healthcare network
              </p>
            </div>
            
            {message.text && (
              <div className={`message ${message.type === 'error' ? 'error-message' : 'success-message'}`}>
                {message.type === 'error' ? (
                  <FaExclamationTriangle className="message-icon" />
                ) : (
                  <FaCheckCircle className="message-icon" />
                )}
                {message.text}
              </div>
            )}
            
            <form className="register-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <FaUserMd className="input-icon" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaStethoscope className="input-icon" />
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Cardiology, Pediatrics"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaIdCardAlt className="input-icon" />
                  Medical License
                </label>
                <input
                  type="text"
                  name="license"
                  value={formData.license}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter medical license number"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaPhone className="input-icon" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaEnvelope className="input-icon" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter email address"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <FaLock className="input-icon" />
                  Password
                </label>
                <div className="input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Create a password"
                    disabled={loading}
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
              
              <div className="form-group">
                <label className="form-label">
                  <FaLock className="input-icon" />
                  Confirm Password
                </label>
                <div className="input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Confirm your password"
                    disabled={loading}
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
              
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner button-icon" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FaArrowRight className="button-icon" />
                  </>
                )}
              </button>
            </form>
            
            <div className="divider">
              <span>Already have an account?</span>
            </div>
            
            <div className="login-section">
              <p className="login-text">Sign in to your existing account</p>
              <button
                type="button"
                className="login-link"
                onClick={handleLogin}
                disabled={loading}
              >
                <FaSignInAlt className="link-icon" />
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
