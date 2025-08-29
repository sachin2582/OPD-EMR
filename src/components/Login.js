import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaUserShield, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: 'doctor'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on user type
        if (data.user.userType === 'doctor') {
          navigate('/doctor');
        } else if (data.user.userType === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard'); // Default fallback
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <FaUserMd />
            <h1>OPD-EMR</h1>
          </div>
          <p>Electronic Medical Records System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">User Type</label>
            <div className="user-type-selector">
              <button
                type="button"
                className={`type-btn ${formData.userType === 'doctor' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'doctor' }))}
              >
                <FaUserMd />
                Doctor
              </button>
              <button
                type="button"
                className={`type-btn ${formData.userType === 'admin' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'admin' }))}
              >
                <FaUserShield />
                Admin
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              {formData.userType === 'doctor' ? 'Email or License Number' : 'Username'}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleInputChange}
              placeholder={formData.userType === 'doctor' ? 'Enter email or license' : 'Enter username'}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner-small"></div>
                Signing In...
              </>
            ) : (
              <>
                <FaSignInAlt />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo Credentials:</p>
          <div className="demo-credentials">
            <div>
              <strong>Admin:</strong> admin / admin123
            </div>
            <div>
              <strong>Doctor:</strong> Use registered email/license
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
