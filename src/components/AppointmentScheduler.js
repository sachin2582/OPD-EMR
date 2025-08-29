import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaStethoscope, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaNotesMedical, 
  FaSave, 
  FaTimes,
  FaUserMd,
  FaPhoneAlt,
  FaArrowLeft,
  FaCalendarDay,
  FaUserFriends,
  FaClock,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaUserPlus,
  FaUsers,
  FaCalendarPlus,
  FaCheckDouble
} from 'react-icons/fa';
import './AppointmentScheduler.css';

const AppointmentScheduler = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form data for existing patient appointment
  const [existingPatientForm, setExistingPatientForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    notes: '',
    status: 'scheduled',
    priority: 'normal',
    duration: '30'
  });

  // Form data for new patient appointment
  const [newPatientForm, setNewPatientForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    notes: '',
    status: 'scheduled',
    priority: 'normal',
    duration: '30'
  });



  const appointmentTypes = [
    { value: 'new-visit', label: 'New Visit', icon: '🆕' },
    { value: 'follow-up', label: 'Follow-up', icon: '🔄' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' },
    { value: 'consultation', label: 'Consultation', icon: '👨‍⚕️' },
    { value: 'routine-checkup', label: 'Routine Checkup', icon: '📋' },
    { value: 'specialist-consultation', label: 'Specialist Consultation', icon: '🎯' },
    { value: 'procedure', label: 'Procedure', icon: '🔬' },
    { value: 'surgery', label: 'Surgery', icon: '⚕️' },
    { value: 'therapy', label: 'Therapy', icon: '🧠' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#10b981' },
    { value: 'normal', label: 'Normal', color: '#3b82f6' },
    { value: 'high', label: 'High', color: '#f59e0b' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' }
  ];

  const durations = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ];

  const genders = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setPatients(data);
        } else if (data && Array.isArray(data.patients)) {
          setPatients(data.patients);
        } else {
          setPatients([]);
        }
      } else {
        setPatients([
          { id: 1, firstName: 'John', lastName: 'Doe', phone: '+1234567890', email: 'john.doe@email.com' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', phone: '+1234567891', email: 'jane.smith@email.com' },
          { id: 3, firstName: 'Mike', lastName: 'Johnson', phone: '+1234567892', email: 'mike.johnson@email.com' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([
        { id: 1, firstName: 'John', lastName: 'Doe', phone: '+1234567890', email: 'john.doe@email.com' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', phone: '+1234567891', email: 'jane.smith@email.com' },
        { id: 3, firstName: 'Mike', lastName: 'Johnson', phone: '+1234567892', email: 'mike.johnson@email.com' }
      ]);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setDoctors(data);
        } else if (data && Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
        } else {
          setDoctors([]);
        }
      } else {
        setDoctors([
          { id: 1, firstName: 'Sarah', lastName: 'Wilson', specialization: 'Cardiology', email: 'sarah.wilson@demr.com' },
          { id: 2, firstName: 'Robert', lastName: 'Chen', specialization: 'Neurology', email: 'robert.chen@demr.com' },
          { id: 3, firstName: 'Emily', lastName: 'Davis', specialization: 'Pediatrics', email: 'emily.davis@demr.com' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([
        { id: 1, firstName: 'Sarah', lastName: 'Wilson', specialization: 'Cardiology', email: 'sarah.wilson@demr.com' },
        { id: 2, firstName: 'Robert', lastName: 'Chen', specialization: 'Neurology', email: 'robert.chen@demr.com' },
        { id: 3, firstName: 'Emily', lastName: 'Davis', specialization: 'Pediatrics', email: 'emily.davis@demr.com' }
      ]);
    }
  };

  const handleExistingPatientInputChange = (e) => {
    const { name, value } = e.target;
    setExistingPatientForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNewPatientInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatientForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };



  const validateExistingPatientForm = () => {
    const newErrors = {};

    if (!existingPatientForm.patientId) newErrors.patientId = 'Patient is required';
    if (!existingPatientForm.doctorId) newErrors.doctorId = 'Doctor is required';
    if (!existingPatientForm.appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
    if (!existingPatientForm.appointmentTime) newErrors.appointmentTime = 'Appointment time is required';
    if (!existingPatientForm.appointmentType) newErrors.appointmentType = 'Appointment type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPatientForm = () => {
    const newErrors = {};

    if (!newPatientForm.firstName) newErrors.firstName = 'First name is required';
    if (!newPatientForm.lastName) newErrors.lastName = 'Last name is required';
    if (!newPatientForm.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!newPatientForm.age) newErrors.age = 'Age is required';
    if (!newPatientForm.gender) newErrors.gender = 'Gender is required';
    if (!newPatientForm.phone) newErrors.phone = 'Phone number is required';
    if (!newPatientForm.doctorId) newErrors.doctorId = 'Doctor is required';
    if (!newPatientForm.appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
    if (!newPatientForm.appointmentTime) newErrors.appointmentTime = 'Appointment time is required';
    if (!newPatientForm.appointmentType) newErrors.appointmentType = 'Appointment type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleExistingPatientSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateExistingPatientForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(existingPatientForm),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(`Appointment scheduled successfully! Appointment ID: ${result.appointment.appointmentId}`);
        setShowSuccess(true);
        
        // Reset form
        setExistingPatientForm({
          patientId: '',
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '',
          appointmentType: '',
          notes: '',
          status: 'scheduled',
          priority: 'normal',
          duration: '30'
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        alert(`Scheduling failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Scheduling failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPatientSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateNewPatientForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const appointmentData = {
        newPatient: true,
        firstName: newPatientForm.firstName,
        lastName: newPatientForm.lastName,
        dateOfBirth: newPatientForm.dateOfBirth,
        age: newPatientForm.age,
        gender: newPatientForm.gender,
        phone: newPatientForm.phone,
        email: newPatientForm.email,
        address: newPatientForm.address,
        doctorId: newPatientForm.doctorId,
        appointmentDate: newPatientForm.appointmentDate,
        appointmentTime: newPatientForm.appointmentTime,
        appointmentType: newPatientForm.appointmentType,
        notes: newPatientForm.notes,
        status: newPatientForm.status,
        priority: newPatientForm.priority,
        duration: newPatientForm.duration
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(`New patient registered and appointment scheduled successfully! Appointment ID: ${result.appointment.appointmentId}`);
        setShowSuccess(true);
        
        // Reset form
        setNewPatientForm({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          age: '',
          gender: '',
          phone: '',
          email: '',
          address: '',
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '',
          appointmentType: '',
          notes: '',
          status: 'scheduled',
          priority: 'normal',
          duration: '30'
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        alert(`Scheduling failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Scheduling failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPatient = () => {
    return patients.find(p => p.id === parseInt(existingPatientForm.patientId));
  };

  const getSelectedDoctor = () => {
    const doctorId = activeTab === 'existing' ? existingPatientForm.doctorId : newPatientForm.doctorId;
    return doctors.find(d => d.id === parseInt(doctorId));
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : '#3b82f6';
  };

  const getAppointmentTypeIcon = (type) => {
    const typeObj = appointmentTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : '📅';
  };

  const filteredPatients = patients.filter(patient => 
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="demr-appointments">
             {/* Header */}
       <div className="appointments-header">
         <div className="header-content">
           <div className="header-left">
             <button 
               onClick={() => navigate('/dashboard')} 
               className="back-button"
             >
               <FaArrowLeft />
               <span>Back to Dashboard</span>
             </button>
           </div>
         </div>
       </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="success-banner">
          <FaCheckCircle className="success-icon" />
          <span>{successMessage}</span>
          <button 
            className="close-success" 
            onClick={() => setShowSuccess(false)}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Patient Type Selection Tabs */}
      <div className="patient-type-tabs">
        <button 
          className={`patient-tab ${activeTab === 'existing' ? 'active' : ''}`}
          onClick={() => setActiveTab('existing')}
        >
          <FaUsers />
          <span>Existing Patient</span>
        </button>
        <button 
          className={`patient-tab ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          <FaUserPlus />
          <span>New Patient</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="appointments-main">
        <main className="main-content">
          {/* Quick Info Cards */}
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">
                <FaUser />
              </div>
              <div className="info-content">
                <h3>{patients.length}</h3>
                <p>Registered Patients</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <FaUserMd />
              </div>
              <div className="info-content">
                <h3>{doctors.length}</h3>
                <p>Available Doctors</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">
                <FaClock />
              </div>
              <div className="info-content">
                <h3>{timeSlots.length}</h3>
                <p>Time Slots</p>
              </div>
            </div>
          </div>

          {/* Existing Patient Appointment Form */}
          {activeTab === 'existing' && (
            <div className="appointments-section">
              <div className="section-header">
                <FaUsers className="section-icon" />
                <div>
                  <h2>Schedule Appointment for Existing Patient</h2>
                  <p>Select from registered patients and schedule their appointment</p>
                </div>
              </div>
              
              <form onSubmit={handleExistingPatientSubmit} className="appointment-form">
                {/* Main Form Container */}
                <div className="form-container">
                  {/* Left Panel - Patient Information */}
                  <div className="patient-panel">
                    <div className="patient-panel-header">
                      <div className="patient-panel-icon">
                        <FaUser />
                      </div>
                      <h3>Patient Selection</h3>
                    </div>
                    
                    {/* Search Section */}
                    <div className="search-section">
                      <div className="search-header">
                        <FaSearch />
                        <span>Search Patients</span>
                      </div>
                      <div className="search-input-container">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search by name, phone, or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                      </div>
                      
                      {/* Patient Results */}
                      {searchTerm && (
                        <div className="patient-results">
                          {filteredPatients.map(patient => (
                            <div 
                              key={patient.id} 
                              className="patient-result-item"
                              onClick={() => setExistingPatientForm(prev => ({ ...prev, patientId: patient.id }))}
                            >
                              <div className="patient-avatar">
                                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                              </div>
                              <div className="patient-info">
                                <div className="patient-name">
                                  {patient.firstName} {patient.lastName}
                                </div>
                                <div className="patient-details">
                                  <div className="patient-contact">
                                    <FaPhoneAlt />
                                    {patient.phone}
                                  </div>
                                  {patient.email && (
                                    <div className="patient-contact">
                                      <FaEnvelope />
                                      {patient.email}
                                    </div>
                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Patient Display */}
                    {existingPatientForm.patientId && (
                      <div className="search-section">
                        <div className="search-header">
                          <FaUser />
                          <span>Selected Patient</span>
                        </div>
                        {(() => {
                          const patient = getSelectedPatient();
                          return patient ? (
                            <div className="patient-result-item">
                              <div className="patient-avatar">
                                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                              </div>
                              <div className="patient-info">
                                <div className="patient-name">
                                  {patient.firstName} {patient.lastName}
                                </div>
                                <div className="patient-details">
                                  <div className="patient-contact">
                                    <FaPhoneAlt />
                                    {patient.phone}
                                  </div>
                                  {patient.email && (
                                    <div className="patient-contact">
                                      <FaEnvelope />
                                      {patient.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Right Panel - Appointment Details */}
                  <div className="appointment-panel">
                    <div className="appointment-panel-header">
                      <div className="appointment-panel-icon">
                        <FaCalendarDay />
                      </div>
                      <h3>Appointment Details</h3>
                    </div>
                    
                    {/* Core Appointment Fields */}
                    <div className="form-grid-compact">
                      <div className="form-group">
                        <label className="form-label">
                          <FaUserMd className="label-icon" />
                          Select Doctor *
                        </label>
                        <select
                          name="doctorId"
                          className={`form-input ${errors.doctorId ? 'error' : ''}`}
                          value={existingPatientForm.doctorId}
                          onChange={handleExistingPatientInputChange}
                        >
                          <option value="">Select doctor</option>
                          {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                              Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                            </option>
                          ))}
                        </select>
                        {errors.doctorId && <span className="error-message">{errors.doctorId}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <span className="type-icon">{getAppointmentTypeIcon(existingPatientForm.appointmentType)}</span>
                          Appointment Type *
                        </label>
                        <select
                          name="appointmentType"
                          className={`form-input ${errors.appointmentType ? 'error' : ''}`}
                          value={existingPatientForm.appointmentType}
                          onChange={handleExistingPatientInputChange}
                        >
                          <option value="">Select type</option>
                          {appointmentTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                        {errors.appointmentType && <span className="error-message">{errors.appointmentType}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaCalendarAlt className="label-icon" />
                          Date *
                        </label>
                        <input
                          type="date"
                          name="appointmentDate"
                          className={`form-input ${errors.appointmentDate ? 'error' : ''}`}
                          value={existingPatientForm.appointmentDate}
                          onChange={handleExistingPatientInputChange}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.appointmentDate && <span className="error-message">{errors.appointmentDate}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaClock className="label-icon" />
                          Time *
                        </label>
                        <select
                          name="appointmentTime"
                          className={`form-input ${errors.appointmentTime ? 'error' : ''}`}
                          value={existingPatientForm.appointmentTime}
                          onChange={handleExistingPatientInputChange}
                        >
                          <option value="">Select time</option>
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        {errors.appointmentTime && <span className="error-message">{errors.appointmentTime}</span>}
                      </div>
                    </div>

                    {/* Priority and Duration Section */}
                    <div className="priority-duration-section">
                      <div className="priority-duration-header">
                        <FaExclamationTriangle />
                        <span>Priority & Duration</span>
                      </div>
                      <div className="priority-duration-grid">
                        <div className="form-group">
                          <label className="form-label">
                            <FaExclamationTriangle className="label-icon" />
                            Priority
                          </label>
                          <select
                            name="priority"
                            className="form-input"
                            value={existingPatientForm.priority}
                            onChange={handleExistingPatientInputChange}
                          >
                            {priorities.map(priority => (
                              <option key={priority.value} value={priority.value}>
                                {priority.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            <FaClock className="label-icon" />
                            Duration
                          </label>
                          <select
                            name="duration"
                            className="form-input"
                            value={existingPatientForm.duration}
                            onChange={handleExistingPatientInputChange}
                          >
                            {durations.map(duration => (
                              <option key={duration.value} value={duration.value}>
                                {duration.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="form-group">
                      <label className="form-label">
                        <FaInfoCircle className="label-icon" />
                        Status
                      </label>
                      <select
                        name="status"
                        className="form-input"
                        value={existingPatientForm.status}
                        onChange={handleExistingPatientInputChange}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                      </select>
                    </div>

                    {/* Notes Section */}
                    <div className="notes-section">
                      <div className="notes-header">
                        <FaNotesMedical />
                        <span>Additional Notes</span>
                      </div>
                      <textarea
                        name="notes"
                        className="notes-textarea"
                        value={existingPatientForm.notes}
                        onChange={handleExistingPatientInputChange}
                        placeholder="Enter any additional notes or special instructions..."
                      />
                    </div>
                  </div>
                </div>

                {/* Patient & Doctor Preview */}
                {(existingPatientForm.patientId || existingPatientForm.doctorId) && (
                  <div className="form-section">
                    <h3 className="section-title">
                      <FaUserFriends className="title-icon" />
                      Appointment Summary
                    </h3>
                    
                    <div className="summary-grid">
                      {existingPatientForm.patientId && (
                        <div className="summary-card patient-card">
                          <div className="card-header">
                            <FaUser className="card-icon" />
                            <h4>Patient Details</h4>
                          </div>
                          {(() => {
                            const patient = getSelectedPatient();
                            return patient ? (
                              <div className="summary-content">
                                <div className="info-row">
                                  <span className="info-label">Name:</span>
                                  <span className="info-value">{patient.firstName} {patient.lastName}</span>
                                </div>
                                <div className="info-row">
                                  <FaPhoneAlt className="info-icon" />
                                  <span className="info-label">Phone:</span>
                                  <span className="info-value">{patient.phone}</span>
                                </div>
                                {patient.email && (
                                  <div className="info-row">
                                    <FaEnvelope className="info-icon" />
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{patient.email}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="not-found">Patient not found</p>
                            );
                          })()}
                        </div>
                      )}

                      {existingPatientForm.doctorId && (
                        <div className="summary-card doctor-card">
                          <div className="card-header">
                            <FaUserMd className="card-icon" />
                            <h4>Doctor Details</h4>
                          </div>
                          {(() => {
                            const doctor = getSelectedDoctor();
                            return doctor ? (
                              <div className="summary-content">
                                <div className="info-row">
                                  <span className="info-label">Name:</span>
                                  <span className="info-value">Dr. {doctor.firstName} {doctor.lastName}</span>
                                </div>
                                <div className="info-row">
                                  <FaStethoscope className="info-icon" />
                                  <span className="info-label">Specialization:</span>
                                  <span className="info-value">{doctor.specialization}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="not-found">Doctor not found</p>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Priority Indicator */}
                {existingPatientForm.priority && (
                  <div className="priority-indicator">
                    <div className="priority-badge" style={{ backgroundColor: getPriorityColor(existingPatientForm.priority) }}>
                      <FaExclamationTriangle />
                      <span>Priority: {existingPatientForm.priority.charAt(0).toUpperCase() + existingPatientForm.priority.slice(1)}</span>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="spinner"></div>
                    ) : (
                      <FaSave />
                    )}
                    <span>{loading ? 'Scheduling...' : 'Schedule Appointment'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* New Patient Appointment Form */}
          {activeTab === 'new' && (
            <div className="appointments-section">
              <div className="section-header">
                <FaUserPlus className="section-icon" />
                <div>
                  <h2>Register New Patient & Schedule Appointment</h2>
                  <p>Add a new patient to the system and schedule their appointment</p>
                </div>
              </div>
              
              <form onSubmit={handleNewPatientSubmit} className="appointment-form">
                {/* Main Form Container */}
                <div className="form-container">
                  {/* Left Panel - Patient Information */}
                  <div className="patient-panel">
                    <div className="patient-panel-header">
                      <div className="patient-panel-icon">
                        <FaUser />
                      </div>
                      <h3>Patient Information</h3>
                    </div>
                    
                    {/* Personal Details */}
                    <div className="form-grid-compact">
                      <div className="form-group">
                        <label className="form-label">
                          <FaUser className="label-icon" />
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          className={`form-input ${errors.firstName ? 'error' : ''}`}
                          value={newPatientForm.firstName}
                          onChange={handleNewPatientInputChange}
                          placeholder="Enter first name"
                        />
                        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaUser className="label-icon" />
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          className={`form-input ${errors.lastName ? 'error' : ''}`}
                          value={newPatientForm.lastName}
                          onChange={handleNewPatientInputChange}
                          placeholder="Enter last name"
                        />
                        {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaCalendarAlt className="label-icon" />
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                          value={newPatientForm.dateOfBirth}
                          onChange={handleNewPatientInputChange}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaUser className="label-icon" />
                          Age *
                        </label>
                        <input
                          type="number"
                          name="age"
                          className={`form-input ${errors.age ? 'error' : ''}`}
                          value={newPatientForm.age}
                          onChange={handleNewPatientInputChange}
                          placeholder="Enter age"
                          min="0"
                          max="150"
                        />
                        {errors.age && <span className="error-message">{errors.age}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaUser className="label-icon" />
                          Gender *
                        </label>
                        <select
                          name="gender"
                          className={`form-input ${errors.gender ? 'error' : ''}`}
                          value={newPatientForm.gender}
                          onChange={handleNewPatientInputChange}
                        >
                          <option value="">Select gender</option>
                          {genders.map(gender => (
                            <option key={gender.value} value={gender.value}>
                              {gender.label}
                            </option>
                          ))}
                        </select>
                        {errors.gender && <span className="error-message">{errors.gender}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaPhoneAlt className="label-icon" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className={`form-input ${errors.phone ? 'error' : ''}`}
                          value={newPatientForm.phone}
                          onChange={handleNewPatientInputChange}
                          placeholder="Enter phone number"
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaEnvelope className="label-icon" />
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="form-input"
                          value={newPatientForm.email}
                          onChange={handleNewPatientInputChange}
                          placeholder="Enter email address"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaMapMarkerAlt className="label-icon" />
                          Address
                        </label>
                        <textarea
                          name="address"
                          className="form-input"
                          value={newPatientForm.address}
                          onChange={handleNewPatientInputChange}
                          placeholder="Enter address"
                          rows="2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Appointment Details */}
                  <div className="appointment-panel">
                    <div className="appointment-panel-header">
                      <div className="appointment-panel-icon">
                        <FaCalendarDay />
                      </div>
                      <h3>Appointment Details</h3>
                    </div>
                    
                    {/* Core Appointment Fields */}
                    <div className="form-grid-compact">
                      <div className="form-group">
                        <label className="form-label">
                          <FaUserMd className="label-icon" />
                          Select Doctor *
                        </label>
                        <select
                          name="doctorId"
                          className={`form-input ${errors.doctorId ? 'error' : ''}`}
                          value={newPatientForm.doctorId}
                          onChange={handleNewPatientInputChange}
                        >
                          <option value="">Select doctor</option>
                          {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                              Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                            </option>
                          ))}
                        </select>
                        {errors.doctorId && <span className="error-message">{errors.doctorId}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <span className="type-icon">{getAppointmentTypeIcon(newPatientForm.appointmentType)}</span>
                          Appointment Type *
                        </label>
                        <select
                          name="appointmentType"
                          className={`form-input ${errors.appointmentType ? 'error' : ''}`}
                          value={newPatientForm.appointmentType}
                          onChange={handleNewPatientInputChange}
                        >
                          <option value="">Select type</option>
                          {appointmentTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                        {errors.appointmentType && <span className="error-message">{errors.appointmentType}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaCalendarAlt className="label-icon" />
                          Date *
                        </label>
                        <input
                          type="date"
                          name="appointmentDate"
                          className={`form-input ${errors.appointmentDate ? 'error' : ''}`}
                          value={newPatientForm.appointmentDate}
                          onChange={handleNewPatientInputChange}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.appointmentDate && <span className="error-message">{errors.appointmentDate}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FaClock className="label-icon" />
                          Time *
                        </label>
                        <select
                          name="appointmentTime"
                          className={`form-input ${errors.appointmentTime ? 'error' : ''}`}
                          value={newPatientForm.appointmentTime}
                          onChange={handleNewPatientInputChange}
                        >
                          <option value="">Select time</option>
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        {errors.appointmentTime && <span className="error-message">{errors.appointmentTime}</span>}
                      </div>
                    </div>

                    {/* Priority and Duration Section */}
                    <div className="priority-duration-section">
                      <div className="priority-duration-header">
                        <FaExclamationTriangle />
                        <span>Priority & Duration</span>
                      </div>
                      <div className="priority-duration-grid">
                        <div className="form-group">
                          <label className="form-label">
                            <FaExclamationTriangle className="label-icon" />
                            Priority
                          </label>
                          <select
                            name="priority"
                            className="form-input"
                            value={newPatientForm.priority}
                            onChange={handleNewPatientInputChange}
                          >
                            {priorities.map(priority => (
                              <option key={priority.value} value={priority.value}>
                                {priority.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            <FaClock className="label-icon" />
                            Duration
                          </label>
                          <select
                            name="duration"
                            className="form-input"
                            value={newPatientForm.duration}
                            onChange={handleNewPatientInputChange}
                          >
                            {durations.map(duration => (
                              <option key={duration.value} value={duration.value}>
                                {duration.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Status Section */}
                    <div className="form-group">
                      <label className="form-label">
                        <FaInfoCircle className="label-icon" />
                        Status
                      </label>
                      <select
                        name="status"
                        className="form-input"
                        value={newPatientForm.status}
                        onChange={handleNewPatientInputChange}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                      </select>
                    </div>

                    {/* Notes Section */}
                    <div className="notes-section">
                      <div className="notes-header">
                        <FaNotesMedical />
                        <span>Additional Notes</span>
                      </div>
                      <textarea
                        name="notes"
                        className="notes-textarea"
                        value={newPatientForm.notes}
                        onChange={handleNewPatientInputChange}
                        placeholder="Enter any additional notes or special instructions..."
                      />
                    </div>
                  </div>
                </div>

                {/* Doctor Preview */}
                {newPatientForm.doctorId && (
                  <div className="summary-section">
                    <div className="summary-header">
                      <div className="summary-icon">
                        <FaUserMd />
                      </div>
                      <h3>Selected Doctor</h3>
                    </div>
                    
                    <div className="summary-content">
                      <div className="summary-card doctor-card">
                        <div className="card-header">
                          <FaUserMd className="card-icon" />
                          <h4>Doctor Details</h4>
                        </div>
                        {(() => {
                          const doctor = getSelectedDoctor();
                          return doctor ? (
                            <div className="summary-content">
                              <div className="info-row">
                                <span className="info-label">Name:</span>
                                <span className="info-value">Dr. {doctor.firstName} {doctor.lastName}</span>
                              </div>
                              <div className="info-row">
                                <FaStethoscope className="info-icon" />
                                <span className="info-label">Specialization:</span>
                                <span className="info-value">{doctor.specialization}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="not-found">Doctor not found</p>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Priority Indicator */}
                {newPatientForm.priority && (
                  <div className="priority-indicator">
                    <div className="priority-badge" style={{ backgroundColor: getPriorityColor(newPatientForm.priority) }}>
                      <FaExclamationTriangle />
                      <span>Priority: {newPatientForm.priority.charAt(0).toUpperCase() + newPatientForm.priority.slice(1)}</span>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="spinner"></div>
                    ) : (
                      <FaCheckDouble />
                    )}
                    <span>{loading ? 'Processing...' : 'Register Patient & Schedule'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
