import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Mock data for demo purposes when backend is not available
const mockPatients = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-15',
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
    currentMedications: 'Amlodipine 5mg',
    createdAt: '2024-01-15T10:30:00.000Z'
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1985-08-22',
    gender: 'Female',
    phone: '+91-9876543212',
    email: 'sarah.j@email.com',
    address: '456 Oak Avenue',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110001',
    bloodGroup: 'A+',
    emergencyContact: 'Mike Johnson',
    emergencyPhone: '+91-9876543213',
    occupation: 'Doctor',
    maritalStatus: 'Single',
    allergies: 'Peanuts',
    medicalHistory: 'Asthma',
    currentMedications: 'Inhaler',
    createdAt: '2024-01-14T15:45:00.000Z'
  },
  {
    id: 3,
    firstName: 'Rajesh',
    lastName: 'Kumar',
    dateOfBirth: '1978-12-10',
    gender: 'Male',
    phone: '+91-9876543214',
    email: 'rajesh.k@email.com',
    address: '789 Pine Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pinCode: '560001',
    bloodGroup: 'B+',
    emergencyContact: 'Priya Kumar',
    emergencyPhone: '+91-9876543215',
    occupation: 'Teacher',
    maritalStatus: 'Married',
    allergies: 'None',
    medicalHistory: 'Diabetes Type 2',
    currentMedications: 'Metformin 500mg',
    createdAt: '2024-01-13T09:20:00.000Z'
  }
];

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetchPatients();
    // Check if we're in production (Vercel) and set offline mode
    if (window.location.hostname.includes('vercel.app')) {
      setIsOffline(true);
    }
  }, []);

  const fetchPatients = async () => {
    if (isOffline) {
      // Use mock data for demo
      setPatients(mockPatients);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/api/patients`);
      
      // Ensure patients is always an array
      if (Array.isArray(response.data)) {
        setPatients(response.data);
      } else if (response.data && Array.isArray(response.data.patients)) {
        setPatients(response.data.patients);
      } else if (response.data && Array.isArray(response.data.data)) {
        setPatients(response.data.data);
      } else {
        console.warn('Unexpected API response format:', response.data);
        setPatients([]);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      console.log('Backend not available, using mock data');
      setIsOffline(true);
      setPatients(mockPatients);
      setError('Backend not available. Using demo data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      if (isOffline) {
        // Simulate deletion for demo
        setPatients(prev => prev.filter(p => p.id !== id));
        return;
      }

      try {
        await axios.delete(`${API_BASE_URL}/api/patients/${id}`);
        fetchPatients();
      } catch (err) {
        setError('Failed to delete patient');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/add-patient/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return 'Invalid Date';
    }
  };

  const safePatients = Array.isArray(patients) ? patients : [];
  const filteredPatients = safePatients.filter(patient => {
    if (!patient) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.firstName?.toLowerCase().includes(searchLower) ||
      patient.lastName?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.city?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading patients...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
            {isOffline ? '🔄 Demo Mode (Backend Offline)' : '🔗 API Endpoint: ' + API_BASE_URL}
          </span>
          {isOffline && (
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              Using mock data for demonstration
            </span>
          )}
        </div>

        {/* Header */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>Patient Management</h1>
            <p style={{ margin: 0, color: '#666' }}>
              {isOffline ? 'Demo Mode: Managing sample patient data' : 'Manage your patient records'}
            </p>
          </div>
          <button
            onClick={() => navigate('/add-patient')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            + Add Patient
          </button>
        </div>

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

        {/* Search and Filters */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Search patients by name, phone, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {filteredPatients.length} of {safePatients.length} patients
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#333' }}>
                    Patient Name
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#333' }}>
                    Contact Info
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#333' }}>
                    Location
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#333' }}>
                    Medical Info
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#333' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map(patient => (
                    <tr key={patient.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            ID: {patient.id} • {patient.gender} • {formatDate(patient.dateOfBirth)}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <div style={{ marginBottom: '5px' }}>
                            📱 {patient.phone}
                          </div>
                          {patient.email && (
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              ✉️ {patient.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <div style={{ marginBottom: '5px' }}>
                            🏠 {patient.city}, {patient.state}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            📍 {patient.pinCode}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div>
                          <div style={{ marginBottom: '5px' }}>
                            🩸 {patient.bloodGroup || 'N/A'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            💼 {patient.occupation || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleEdit(patient.id)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '14px',
                              cursor: 'pointer',
                              transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '14px',
                              cursor: 'pointer',
                              transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
