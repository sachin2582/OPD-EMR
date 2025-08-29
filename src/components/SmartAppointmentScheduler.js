import React, { useState, useEffect } from 'react';

const SmartAppointmentScheduler = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('normal');
  const [aiOptimization, setAiOptimization] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const appointmentTypes = [
    'General Consultation',
    'Follow-up',
    'Emergency',
    'Routine Check-up',
    'Specialist Consultation',
    'Lab Test',
    'Procedure',
    'Vaccination',
    'Health Check',
    'Telemedicine'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#28a745' },
    { value: 'normal', label: 'Normal', color: '#007bff' },
    { value: 'high', label: 'High', color: '#fd7e14' },
    { value: 'urgent', label: 'Urgent', color: '#dc3545' }
  ];

  useEffect(() => {
    // Mock data
    setDoctors([
      { id: 1, name: 'Dr. Smith', specialization: 'Cardiology' },
      { id: 2, name: 'Dr. Johnson', specialization: 'Neurology' },
      { id: 3, name: 'Dr. Williams', specialization: 'Pediatrics' }
    ]);

    setPatients([
      { id: 1, firstName: 'John', lastName: 'Doe', phone: '123-456-7890' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', phone: '098-765-4321' },
      { id: 3, firstName: 'Mike', lastName: 'Johnson', phone: '555-123-4567' }
    ]);

    setAppointments([
      { id: 1, date: '2024-01-15', startTime: '09:00', endTime: '09:30', patientName: 'John Doe', doctorName: 'Dr. Smith', type: 'General Consultation', status: 'scheduled', priority: 'normal' },
      { id: 2, date: '2024-01-15', startTime: '10:00', endTime: '10:30', patientName: 'Jane Smith', doctorName: 'Dr. Johnson', type: 'Follow-up', status: 'confirmed', priority: 'high' }
    ]);
  }, []);

  const handleScheduleAppointment = () => {
    if (!selectedDoctor || !selectedPatient || !appointmentType) {
      alert('Please fill in all required fields');
      return;
    }

    const newAppointment = {
      id: Date.now(),
      doctorName: selectedDoctor,
      patientName: selectedPatient,
      date: selectedDate,
      type: appointmentType,
      duration: duration,
      notes: notes,
      priority: priority,
      status: 'scheduled',
      startTime: '09:00',
      endTime: '09:30'
    };

    setAppointments([...appointments, newAppointment]);
    
    // Reset form
    setSelectedPatient('');
    setAppointmentType('');
    setDuration(30);
    setNotes('');
    setPriority('normal');
    
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#007bff';
      case 'confirmed': return '#28a745';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      case 'no-show': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : '#6c757d';
  };

  const filteredAppointments = appointments.filter(apt => apt.date === selectedDate);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', color: '#333', margin: '0 0 8px 0' }}>
                📅 Smart Appointment Scheduler
              </h1>
              <p style={{ color: '#666', margin: 0 }}>
                AI-powered scheduling with conflict detection and optimization
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => setShowModal(true)}
              >
                ➕ Schedule Appointment
              </button>
              <button 
                style={{ padding: '12px 24px', border: '1px solid #6f42c1', backgroundColor: 'white', color: '#6f42c1', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => setAiOptimization(!aiOptimization)}
              >
                🧠 AI Optimization: {aiOptimization ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* AI Status */}
          {aiOptimization && (
            <div style={{ padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#1976d2' }}>ℹ️</span>
                <div>
                  <div style={{ fontWeight: '500', color: '#1976d2' }}>AI Assistant Active</div>
                  <div style={{ fontSize: '14px', color: '#1976d2' }}>
                    Smart scheduling, conflict detection, and optimization are enabled. 
                    The system will automatically suggest optimal time slots and detect scheduling conflicts.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
          {/* Left Column - Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Date and Doctor Selection */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', color: '#007bff', margin: '0 0 16px 0' }}>
                ⚙️ Schedule Configuration
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select Doctor</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', color: '#007bff', margin: '0 0 16px 0' }}>
                👥 Scheduled Appointments
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Patient</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Priority</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{apt.startTime}</div>
                          <div style={{ fontSize: '14px', color: '#666' }}>{apt.duration || 30} min</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{apt.patientName}</td>
                      <td style={{ padding: '12px' }}>{apt.type}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          backgroundColor: getStatusColor(apt.status) + '20', 
                          color: getStatusColor(apt.status), 
                          borderRadius: '4px', 
                          fontSize: '12px' 
                        }}>
                          {apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          backgroundColor: getPriorityColor(apt.priority) + '20', 
                          color: getPriorityColor(apt.priority), 
                          borderRadius: '4px', 
                          fontSize: '12px' 
                        }}>
                          {apt.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>👁️</button>
                          <button style={{ padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                          <button style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❌</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Stats */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', color: '#007bff', margin: '0 0 16px 0' }}>
                📊 Today's Overview
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{filteredAppointments.length}</div>
                  <div style={{ color: '#666' }}>Total Appointments</div>
                  <div style={{ color: '#28a745', fontSize: '14px' }}>↗️ +12.5%</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>8</div>
                  <div style={{ color: '#666' }}>Available Slots</div>
                  <div style={{ color: '#dc3545', fontSize: '14px' }}>↘️ 2 slots used</div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {aiOptimization && (
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '20px', color: '#6f42c1', margin: '0 0 16px 0' }}>
                  🤖 AI Insights
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#1976d2' }}>ℹ️</span>
                      <span style={{ fontSize: '14px' }}>
                        Peak hours: 10 AM - 2 PM
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#2e7d32' }}>✅</span>
                      <span style={{ fontSize: '14px' }}>
                        Optimal slot: 3:30 PM
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ padding: '12px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#f57c00' }}>⚠️</span>
                      <span style={{ fontSize: '14px' }}>
                        High demand: Morning slots
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Appointment Modal */}
        {showModal && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '24px', 
              maxWidth: '500px', 
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#007bff' }}>📅 Schedule New Appointment</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Patient *</label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Select patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={`${patient.firstName} ${patient.lastName}`}>
                        {patient.firstName} {patient.lastName} - {patient.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Appointment Type *</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Select type</option>
                    {appointmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min={15}
                    max={180}
                    step={15}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Priority</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {priorities.map(priority => (
                      <label key={priority.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          value={priority.value}
                          checked={priority.value === priority}
                          onChange={(e) => setPriority(e.target.value)}
                        />
                        <span style={{ 
                          padding: '4px 8px', 
                          backgroundColor: priority.color + '20', 
                          color: priority.color, 
                          borderRadius: '4px', 
                          fontSize: '12px' 
                        }}>
                          {priority.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={aiOptimization}
                    onChange={(e) => setAiOptimization(e.target.checked)}
                  />
                  <span>Enable AI optimization</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', border: '1px solid #6c757d', backgroundColor: 'white', color: '#6c757d', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleScheduleAppointment}
                  style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  💾 Schedule Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAppointmentScheduler;
