import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Mock data for demo purposes when backend is not available
const mockPatients = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-15',
    age: '33',
    gender: 'Male',
    phone: '+91-9876543210',
    email: 'john.doe@email.com',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400001',
    bloodGroup: 'O+',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+91-9876543211',
    occupation: 'Software Engineer',
    maritalStatus: 'Married',
    allergies: 'None',
    medicalHistory: 'Hypertension',
    currentMedications: 'Amlodipine 5mg'
  }
];

const PatientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    bloodGroup: '',
    emergencyContact: '',
    emergencyPhone: '',
    occupation: '',
    maritalStatus: '',
    allergies: '',
    medicalHistory: '',
    currentMedications: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchPatientData();
    }
    // Only set offline mode for Vercel deployment, not for local development
    if (window.location.hostname.includes('vercel.app')) {
      setIsOffline(true);
    } else {
      // For local development, test backend connection
      testBackendConnection();
    }
  }, [id]);

  const testBackendConnection = async () => {
    try {
      console.log('🔍 [FRONTEND] Testing backend connection...');
      console.log('🔍 [FRONTEND] API_BASE_URL:', API_BASE_URL);
      console.log('🔍 [FRONTEND] Full URL:', `${API_BASE_URL}/health`);
      
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ [FRONTEND] Backend connection successful:', response.data);
      setIsOffline(false);
    } catch (err) {
      console.log('❌ [FRONTEND] Backend connection failed:', err.message);
      console.log('❌ [FRONTEND] Error details:', err);
      console.log('❌ [FRONTEND] Error response:', err.response);
      setIsOffline(true);
    }
  };

  const fetchPatientData = async () => {
    if (isOffline) {
      // Use mock data for demo
      const mockPatient = mockPatients.find(p => p.id === parseInt(id));
      if (mockPatient) {
        setFormData(mockPatient);
        return;
      }
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/patients/${id}`);
      setFormData(response.data);
    } catch (err) {
      console.log('❌ [FRONTEND] Error fetching patient data:', err.message);
      // Only set offline mode if we're actually on Vercel
      if (window.location.hostname.includes('vercel.app')) {
        console.log('🔄 [FRONTEND] Vercel deployment - using mock data');
        setIsOffline(true);
        const mockPatient = mockPatients.find(p => p.id === parseInt(id));
        if (mockPatient) {
          setFormData(mockPatient);
        }
      } else {
        console.log('❌ [FRONTEND] Local development - backend connection failed');
        setError('Failed to load patient data. Please check if the backend server is running.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Auto-calculate age when date of birth changes
      if (name === 'dateOfBirth' && value) {
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        newData.age = age.toString();
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔵 [FRONTEND] Patient form submission started');
    console.log('📝 [FRONTEND] Form data:', JSON.stringify(formData, null, 2));
    console.log('🔗 [FRONTEND] API Base URL:', API_BASE_URL);
    console.log('🔄 [FRONTEND] Is Edit Mode:', isEditMode);
    console.log('📱 [FRONTEND] Is Offline:', isOffline);
    
    setLoading(true);
    setError('');
    setSuccess('');

    if (isOffline) {
      console.log('⚠️ [FRONTEND] Running in offline mode - simulating success');
      // Simulate success for demo
      setTimeout(() => {
        setLoading(false);
        navigate('/patients');
      }, 1000);
      return;
    }

    try {
      const url = isEditMode 
        ? `${API_BASE_URL}/api/patients/${id}` 
        : `${API_BASE_URL}/api/patients`;
      
      // Prepare data for backend - ensure required fields are present
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address,
        city: formData.city || null,
        state: formData.state || null,
        pinCode: formData.pinCode || null,
        bloodGroup: formData.bloodGroup || null,
        emergencyContact: formData.emergencyContact || null,
        emergencyPhone: formData.emergencyPhone || null,
        occupation: formData.occupation || null,
        maritalStatus: formData.maritalStatus || null,
        allergies: formData.allergies || null,
        medicalHistory: formData.medicalHistory || null,
        currentMedications: formData.currentMedications || null
      };
      
      console.log('📡 [FRONTEND] Making API request to:', url);
      console.log('📡 [FRONTEND] Request method:', isEditMode ? 'PUT' : 'POST');
      console.log('📡 [FRONTEND] Request payload:', JSON.stringify(submitData, null, 2));
      console.log('📡 [FRONTEND] API_BASE_URL:', API_BASE_URL);
      console.log('📡 [FRONTEND] Full request URL:', url);
      
      let response;
      if (isEditMode) {
        console.log('🔄 [FRONTEND] Updating existing patient...');
        response = await axios.put(url, submitData);
      } else {
        console.log('➕ [FRONTEND] Creating new patient...');
        response = await axios.post(url, submitData);
      }
      
      console.log('✅ [FRONTEND] API request successful!');
      console.log('📊 [FRONTEND] Response status:', response.status);
      console.log('📊 [FRONTEND] Response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.patient) {
        console.log('👤 [FRONTEND] Patient created/updated successfully:');
        console.log('  - Patient ID:', response.data.patient.id);
        console.log('  - Patient Number:', response.data.patient.patientId);
        console.log('  - Name:', `${response.data.patient.firstName} ${response.data.patient.lastName}`);
        
        // Show success message
        setSuccess(`✅ Patient ${isEditMode ? 'updated' : 'created'} successfully! Patient ID: ${response.data.patient.patientId}`);
      }
      
      console.log('🔄 [FRONTEND] Navigating to patients list...');
      setTimeout(() => {
        navigate('/patients');
      }, 2000); // Give user time to see success message
      
    } catch (err) {
      console.log('❌ [FRONTEND] API request failed!');
      console.log('❌ [FRONTEND] Error object:', err);
      console.log('❌ [FRONTEND] Error message:', err.message);
      console.log('❌ [FRONTEND] Error response:', err.response);
      
      if (err.response) {
        console.log('📊 [FRONTEND] Response status:', err.response.status);
        console.log('📊 [FRONTEND] Response data:', JSON.stringify(err.response.data, null, 2));
        console.log('📊 [FRONTEND] Response headers:', err.response.headers);
        
        // More detailed error message
        const errorMessage = err.response.data?.message || err.response.data?.error || 'Failed to save patient data';
        const missingFields = err.response.data?.missingFields;
        
        if (missingFields && missingFields.length > 0) {
          setError(`Validation failed. Missing required fields: ${missingFields.join(', ')}`);
        } else {
          setError(errorMessage);
        }
      } else if (err.request) {
        console.log('🌐 [FRONTEND] Network error - no response received');
        console.log('🌐 [FRONTEND] Request details:', err.request);
        setError('Failed to save patient data. Backend not available. Please check if the server is running.');
        // Only set offline mode for Vercel deployment
        if (window.location.hostname.includes('vercel.app')) {
          setIsOffline(true);
        }
      } else {
        console.log('⚠️ [FRONTEND] Request setup error:', err.message);
        setError(`Request failed: ${err.message}`);
      }
    } finally {
      console.log('🏁 [FRONTEND] Form submission completed');
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* API Status Display */}
        <div style={{ 
          padding: '10px 15px', 
          backgroundColor: isOffline ? '#fff3cd' : '#e3f2fd', 
          color: isOffline ? '#856404' : '#1976d2', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: `1px solid ${isOffline ? '#ffeaa7' : '#bbdefb'}`,
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            {isOffline ? '🔄 Demo Mode (Backend Offline)' : '🔗 Connected to Backend API'}
          </span>
          {!isOffline && (
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              Data will be saved to database
            </span>
          )}
          {isOffline && (
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              Using mock data for demonstration
            </span>
          )}
        </div>

        {/* Form Header */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>
            {isEditMode ? 'Edit Patient' : 'Add New Patient'}
          </h1>
          <p style={{ margin: 0, color: '#666' }}>
            {isOffline ? 'Demo Mode: Form will work with sample data' : 'Enter patient information below'}
          </p>
        </div>

        {/* Success Display */}
        {success && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e8f5e8', 
            color: '#2e7d32', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #c8e6c9'
          }}>
            {success}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {/* Patient Information */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#1976d2', borderBottom: '2px solid #1976d2', paddingBottom: '10px', marginBottom: '20px' }}>
              Patient Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="0"
                  max="150"
                  placeholder="Enter age"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#1976d2', borderBottom: '2px solid #1976d2', paddingBottom: '10px', marginBottom: '20px' }}>
              Contact Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91-9876543210"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@email.com"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Street Address"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  placeholder="400001"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#1976d2', borderBottom: '2px solid #1976d2', paddingBottom: '10px', marginBottom: '20px' }}>
              Medical Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Marital Status
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="List any known allergies..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Medical History
                </label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  placeholder="Previous medical conditions, surgeries, etc..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Current Medications
                </label>
                <textarea
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  placeholder="List current medications with dosages..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#1976d2', borderBottom: '2px solid #1976d2', paddingBottom: '10px', marginBottom: '20px' }}>
              Emergency Contact
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  required
                  placeholder="Emergency contact person name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Emergency Phone *
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  required
                  placeholder="+91-9876543210"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            justifyContent: 'flex-end',
            borderTop: '1px solid #eee',
            paddingTop: '20px'
          }}>
            <button
              type="button"
              onClick={() => navigate('/patients')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.backgroundColor = '#0056b3';
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.backgroundColor = '#007bff';
              }}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Patient' : 'Add Patient')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
