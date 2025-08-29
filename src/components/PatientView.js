import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaDownload, FaEdit, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaIdCard, FaUsers, FaGlobe, FaShieldAlt, FaFileAlt, FaCalendarAlt, FaVenusMars } from 'react-icons/fa';

const PatientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${id}`);
        if (response.ok) {
          const patientData = await response.json();
          setPatient(patientData);
        } else {
          console.error('Failed to fetch patient');
          setPatient(null);
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatient();
    }
  }, [id]);

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading patient information...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>Patient Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The patient you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/patients" className="btn btn-primary">
          <FaArrowLeft style={{ marginRight: '0.5rem' }} />
          Back to Patients
        </Link>
      </div>
    );
  }

  return (
    <div className="container fade-in-up">
      {/* Header with navigation and actions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              <FaArrowLeft style={{ marginRight: '0.5rem' }} />
              Back
            </button>
            <h1 className="card-title" style={{ margin: 0 }}>
              <FaUser style={{ marginRight: '0.75rem', fontSize: '1.25rem' }} />
              {patient.firstName} {patient.middleName} {patient.lastName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              🆔 Patient ID: #{patient.patientId || patient.id} • {calculateAge(patient.dateOfBirth)} years old • {patient.gender}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={`/patient/${patient.id}/clinical-notes`} className="btn btn-primary">
              <FaFileAlt style={{ marginRight: '0.5rem' }} />
              Clinical Notes
            </Link>
            <button className="btn btn-primary">
              <FaEdit style={{ marginRight: '0.5rem' }} />
              Edit Patient
            </button>
            <button className="btn btn-secondary">
              <FaPrint style={{ marginRight: '0.5rem' }} />
              Print
            </button>
            <button className="btn btn-success">
              <FaDownload style={{ marginRight: '0.5rem' }} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Patient ID Card */}
      <div className="card" style={{ marginBottom: '2rem', background: 'var(--gradient-primary)', color: 'white' }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🆔</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
            Patient ID: #{patient.patientId || patient.id}
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: '0.9', margin: 0 }}>
            This is the unique identifier for {patient.firstName} {patient.lastName}
          </p>
        </div>
      </div>

      {/* Patient Details */}
      <div className="patient-details">
        {/* Personal Information */}
        <div className="detail-section">
          <h2 className="section-title">
            <FaUser style={{ marginRight: '0.75rem' }} />
            Personal Information
          </h2>
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">
                <FaUser style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Full Name
              </div>
              <div className="detail-value">
                {patient.firstName} {patient.middleName} {patient.lastName}
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaCalendarAlt style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Date of Birth
              </div>
              <div className="detail-value">
                {formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} years old)
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaVenusMars style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Gender
              </div>
              <div className="detail-value">{patient.gender}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaHeartbeat style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Blood Group
              </div>
              <div className="detail-value">
                <span style={{ 
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  background: 'var(--gradient-primary)',
                  color: 'white'
                }}>
                  {patient.bloodGroup}
                </span>
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaUsers style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Marital Status
              </div>
              <div className="detail-value">{patient.maritalStatus}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaIdCard style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Occupation
              </div>
              <div className="detail-value">{patient.occupation}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaIdCard style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Education Level
              </div>
              <div className="detail-value">{patient.education}</div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="detail-section">
          <h2 className="section-title">
            <FaPhone style={{ marginRight: '0.75rem' }} />
            Contact Information
          </h2>
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">
                <FaPhone style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Phone Number
              </div>
              <div className="detail-value">{patient.phone}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaEnvelope style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Email Address
              </div>
              <div className="detail-value">{patient.email}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaMapMarkerAlt style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Address
              </div>
              <div className="detail-value">
                {patient.address}<br />
                {patient.city}, {patient.state} {patient.zipCode}<br />
                {patient.country}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="detail-section">
          <h2 className="section-title">
            <FaPhone style={{ marginRight: '0.75rem' }} />
            Emergency Contact
          </h2>
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">
                <FaUser style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Contact Name
              </div>
              <div className="detail-value">{patient.emergencyContactName}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaPhone style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Contact Phone
              </div>
              <div className="detail-value">{patient.emergencyContactPhone}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaUsers style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Relationship
              </div>
              <div className="detail-value">{patient.emergencyContactRelationship}</div>
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div className="detail-section">
          <h2 className="section-title">
            <FaUsers style={{ marginRight: '0.75rem' }} />
            Family Information
          </h2>
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">
                <FaUsers style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Family History
              </div>
              <div className="detail-value">{patient.familyHistory}</div>
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="detail-section">
          <h2 className="section-title">
            <FaShieldAlt style={{ marginRight: '0.75rem' }} />
            Insurance Information
          </h2>
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">
                <FaShieldAlt style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Insurance Provider
              </div>
              <div className="detail-value">{patient.insuranceProvider}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaIdCard style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Policy Number
              </div>
              <div className="detail-value">{patient.insurancePolicyNumber}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaIdCard style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Group Number
              </div>
              <div className="detail-value">{patient.insuranceGroupNumber}</div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="detail-section">
          <h2 className="section-title">
            <FaHeartbeat style={{ marginRight: '0.75rem' }} />
            Medical Information
          </h2>
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">
                <FaHeartbeat style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Allergies
              </div>
              <div className="detail-value">
                {patient.allergies ? patient.allergies : 'None reported'}
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaHeartbeat style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Current Medications
              </div>
              <div className="detail-value">
                {patient.currentMedications ? patient.currentMedications : 'None currently'}
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaHeartbeat style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Medical History
              </div>
              <div className="detail-value">{patient.medicalHistory}</div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="detail-section">
          <h2 className="section-title">
            <FaFileAlt style={{ marginRight: '0.75rem' }} />
            Additional Information
          </h2>
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">
                <FaGlobe style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Lifestyle
              </div>
              <div className="detail-value">{patient.lifestyle}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FaFileAlt style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                Notes
              </div>
              <div className="detail-value">{patient.notes}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/patients" className="btn btn-secondary">
            <FaArrowLeft style={{ marginRight: '0.5rem' }} />
            Back to Patients
          </Link>
          <Link to="/add-patient" className="btn btn-primary">
            <FaUser style={{ marginRight: '0.5rem' }} />
            Add New Patient
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientView;
