import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaUsers, FaStethoscope, FaCalendarAlt, FaSearch, FaEye, FaPrescription, FaClock, FaUser, FaHeartbeat, FaPhone, FaIdCard, FaThermometerHalf, FaTachometerAlt, FaWeight, FaNotesMedical } from 'react-icons/fa';
import '../styles/MasterTheme.css';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // Only list view

  // Fetch patients from backend API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        console.log('Fetching patients from backend...');
        const response = await fetch('/api/patients');
        if (response.ok) {
          const data = await response.json();
          const allPatients = data.patients || [];
          console.log('All patients from backend:', allPatients);
          setPatients(allPatients);
        } else {
          console.error('Failed to fetch patients');
          setPatients([]);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    const statusMatch = filterStatus === 'all' || (patient.status || 'waiting') === filterStatus;
    const searchMatch = 
      (patient.firstName && patient.firstName.toLowerCase().includes(searchLower)) ||
      (patient.lastName && patient.lastName.toLowerCase().includes(searchLower)) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.chiefComplaint && patient.chiefComplaint.toLowerCase().includes(searchLower)) ||
      (patient.patientId && patient.patientId.toString().includes(searchTerm)) ||
      (patient.id && patient.id.toString().includes(searchTerm));
    
    return statusMatch && searchMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'var(--warning-500)';
      case 'in-progress': return 'var(--primary-500)';
      case 'completed': return 'var(--success-500)';
      default: return 'var(--neutral-500)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Waiting';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const handleStartConsultation = (patientId) => {
    navigate(`/e-prescription/${patientId}`, { 
      state: { 
        patientData: patients.find(p => p.id === patientId),
        mode: 'new'
      } 
    });
  };

  const handleViewPrescription = (patientId) => {
    navigate(`/e-prescription/${patientId}`, { 
      state: { 
        patientData: patients.find(p => p.id === patientId),
        mode: 'view'
      } 
    });
  };

  const updatePatientStatus = (patientId, newStatus) => {
    setPatients(patients.map(patient => 
      patient.id === patientId ? { ...patient, status: newStatus } : patient
    ));
  };

  const getTodayStats = () => {
    const total = patients.length;
    const waiting = patients.filter(p => !p.status || p.status === 'waiting').length;
    const inProgress = patients.filter(p => p.status === 'in-progress').length;
    const completed = patients.filter(p => p.status === 'completed').length;
    
    return { total, waiting, inProgress, completed };
  };

  const stats = getTodayStats();



  return (
    <div className="doctor-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        

        {/* Date Selection */}
        <div className="date-selection">
          <label className="date-label">
            <FaCalendarAlt />
            Select Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Patients</div>
            </div>
          </div>
          <div className="stat-card waiting">
            <div className="stat-icon">🕐</div>
            <div className="stat-content">
              <div className="stat-number">{stats.waiting}</div>
              <div className="stat-label">Waiting</div>
            </div>
          </div>
          <div className="stat-card in-progress">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-number">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filters">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="🔍 Search patients by name, phone, complaint, or patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">📋 All Status</option>
              <option value="waiting">🕐 Waiting</option>
              <option value="in-progress">⚡ In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
            

          </div>
        </div>

        {/* Patient List */}
        <div className="patient-list-section">
          <div className="section-title">
            <FaUsers className="title-icon" />
            <h2>Patient Management</h2>
            <span className="patient-count">({filteredPatients.length} patients)</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <FaUsers style={{ fontSize: '3rem', marginBottom: 'var(--spacing-3)', opacity: 0.5 }} />
              <h3>No patients in the system</h3>
              <p>Start by adding your first patient to the system.</p>
              <button 
                onClick={() => navigate('/add-patient')}
                className="btn btn-primary"
                style={{ marginTop: 'var(--spacing-3)' }}
              >
                <FaUser style={{ marginRight: 'var(--spacing-2)' }} />
                Add First Patient
              </button>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state">
              <FaSearch style={{ fontSize: '3rem', marginBottom: 'var(--spacing-3)', opacity: 0.5 }} />
              <h3>No patients found</h3>
              <p>No patients match your current search criteria.</p>
              <p>Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="patient-container list">
              <div className="patient-list-table">
                <table className="patient-table">
                  <thead>
                    <tr>
                      <th>Patient Info</th>
                      <th>Demographics</th>
                      <th>Appointment</th>
                      <th>Chief Complaint</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map(patient => (
                        <tr key={patient.id}>
                          <td>
                            <div className="patient-info-compact">
                              <div className="patient-name">{patient.firstName} {patient.lastName}</div>
                              <div className="patient-id">ID: {patient.patientId || patient.id}</div>
                              <div className="patient-contact">{patient.phone || 'No phone'}</div>
                            </div>
                          </td>
                          <td>
                            <div className="demographics-compact">
                              <div className="patient-age">{patient.age || 'N/A'} years</div>
                              <div className="patient-gender">{patient.gender || 'N/A'}</div>
                              <div className="patient-blood">{patient.bloodGroup || 'N/A'}</div>
                            </div>
                          </td>
                          <td>
                            <div className="appointment-time-compact">
                              {patient.appointmentTime || 'Not specified'}
                            </div>
                          </td>
                          <td>
                            <div className="complaint-compact">
                              {patient.chiefComplaint || 'Not specified'}
                            </div>
                          </td>
                          <td>
                            <span 
                              className="status-badge-compact"
                              style={{ backgroundColor: getStatusColor(patient.status || 'waiting') }}
                            >
                              {getStatusText(patient.status || 'waiting')}
                            </span>
                          </td>
                          <td>
                            <div className="actions-compact">
                              <button 
                                className="action-btn-compact primary"
                                onClick={() => handleStartConsultation(patient.id)}
                                title="Start Consultation"
                              >
                                <FaPrescription />
                              </button>
                              <button 
                                className="action-btn-compact secondary"
                                onClick={() => handleViewPrescription(patient.id)}
                                title="View Prescription"
                              >
                                <FaEye />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--spacing-6)' }}>
                          <div style={{ color: 'var(--neutral-500)' }}>
                            <FaUsers style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }} />
                            <p>No patients found matching your criteria</p>
                            <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1)' }}>
                              Try adjusting your search terms or filters
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;