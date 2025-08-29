import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
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
      setError('Failed to fetch patients. Please try again.');
      setPatients([]); // Ensure patients is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/patients/${id}`);
        fetchPatients();
      } catch (err) {
        setError('Failed to delete patient');
      }
    }
  };

  // Ensure patients is always an array before filtering
  const safePatients = Array.isArray(patients) ? patients : [];
  
  const filteredPatients = safePatients.filter(patient => {
    if (!patient) return false;
    
    const matchesSearch = (patient.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (patient.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (patient.phone || '').includes(searchTerm);
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && patient.status === 'active';
    if (filterStatus === 'inactive') return matchesSearch && patient.status === 'inactive';
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'inactive': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        ⏳ Loading patients...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          padding: '25px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '28px', 
                color: '#333', 
                margin: '0 0 10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                👥 Patient Management
              </h1>
              <p style={{ color: '#666', margin: 0 }}>
                Manage and view all registered patients
              </p>
            </div>
            
            <button
              onClick={() => navigate('/add-patient')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              ➕ Add New Patient
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          padding: '20px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                🔍 Search Patients
              </label>
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                📊 Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Patients</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                padding: '10px 15px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '5px',
                display: 'inline-block'
              }}>
                <span style={{ fontWeight: '500', color: '#333' }}>
                  Total Patients: {filteredPatients.length}
                </span>
              </div>
            </div>
          </div>
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

        {/* API Status Display */}
        <div style={{ 
          padding: '10px 15px', 
          backgroundColor: '#e3f2fd', 
          color: '#1976d2', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #bbdefb',
          fontSize: '14px'
        }}>
          🔗 API Endpoint: {API_BASE_URL}
        </div>

        {/* Patients Table */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid #e9ecef',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ margin: 0, color: '#333', fontSize: '18px' }}>
              📋 Patient List ({filteredPatients.length} patients)
            </h3>
          </div>

          {filteredPatients.length === 0 ? (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>No patients found</h3>
              <p style={{ margin: 0 }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No patients have been registered yet'
                }
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                minWidth: '800px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e9ecef',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      Patient ID
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e9ecef',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      Name
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e9ecef',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      Age
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e9ecef',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      Phone
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e9ecef',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      Status
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e9ecef',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      Last Visit
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #e9ecef',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => {
                    if (!patient || !patient.id) return null;
                    
                    const age = patient.dateOfBirth 
                      ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                      : 'N/A';
                    
                    return (
                      <tr key={patient.id} style={{ 
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '15px', color: '#007bff', fontWeight: '500' }}>
                          P{patient.id?.toString().padStart(3, '0') || 'N/A'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ fontWeight: '500', color: '#333' }}>
                            {patient.firstName || ''} {patient.lastName || ''}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                            {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A'}
                          </div>
                        </td>
                        <td style={{ padding: '15px', color: '#666' }}>
                          {age === 'N/A' ? 'N/A' : `${age} years`}
                        </td>
                        <td style={{ padding: '15px', color: '#666' }}>
                          {patient.phone || 'N/A'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: getStatusColor(patient.status || 'unknown') + '20',
                            color: getStatusColor(patient.status || 'unknown')
                          }}>
                            {getStatusText(patient.status || 'unknown')}
                          </span>
                        </td>
                        <td style={{ padding: '15px', color: '#666' }}>
                          {patient.lastVisit 
                            ? new Date(patient.lastVisit).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => navigate(`/patient/${patient.id}`)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                              title="View Details"
                            >
                              👁️ View
                            </button>
                            
                            <button
                              onClick={() => navigate(`/add-patient/${patient.id}`)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                              title="Edit Patient"
                            >
                              ✏️ Edit
                            </button>
                            
                            <button
                              onClick={() => handleDelete(patient.id)}
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                              title="Delete Patient"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          padding: '20px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginTop: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '18px' }}>
            🚀 Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/add-patient')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              ➕ Add New Patient
            </button>
            
            <button
              onClick={() => navigate('/appointments')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              📅 Schedule Appointment
            </button>
            
            <button
              onClick={() => window.print()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              🖨️ Print List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
