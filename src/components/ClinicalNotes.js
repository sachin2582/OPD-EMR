import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaStethoscope, 
  FaUser, 
  FaCalendarAlt, 
  FaUserMd, 
  FaSave, 
  FaHistory, 
  FaEdit,
  FaTrash,
  FaEye,
  FaClipboardList,
  FaThermometerHalf,
  FaHeartbeat,
  FaWeight,
  FaRuler,
  FaNotesMedical,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowLeft,
  FaPills,
  FaBrain,
  FaTimes
} from 'react-icons/fa';

const ClinicalNotes = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);

  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    patientId: patientId || '',
    doctorId: '',
    visitDate: new Date().toISOString().split('T')[0],
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    vitalSigns: {
      bloodPressure: '',
      pulse: '',
      temperature: '',
      weight: '',
      height: '',
      oxygenSaturation: ''
    },
    physicalExamination: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    followUp: '',
    notes: ''
  });

  // Fetch patients and doctors on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchPatients();
      await fetchDoctors();
    };
    fetchInitialData();
  }, [fetchPatients, fetchDoctors]);

  // Fetch patient and notes when patientId changes
  useEffect(() => {
    if (patientId) {
      const fetchPatientData = async () => {
        await fetchPatient();
        await fetchNotes();
        setFormData(prev => ({ ...prev, patientId }));
      };
      fetchPatientData();
    }
  }, [patientId, fetchPatient, fetchNotes]);

  // SOAP Templates
  const soapTemplates = {
    'general-consultation': {
      name: 'General Consultation',
      subjective: 'Patient presents with [chief complaint]. Duration: [duration]. Associated symptoms: [symptoms].',
      objective: 'General appearance: [appearance]. Vital signs: BP [systolic]/[diastolic] mmHg, Pulse [rate] bpm, Temperature [temp]°C, Weight [weight] kg, Height [height] cm. Systemic examination: [findings].',
      assessment: 'Assessment: [working diagnosis]',
      plan: 'Plan: [treatment plan]',
      diagnosis: 'Diagnosis: [diagnosis]',
      medications: 'Medications: [medications]',
      followUp: 'Follow-up: [follow-up plan]'
    },
    'follow-up': {
      name: 'Follow-up Visit',
      subjective: 'Patient returns for follow-up. Previous diagnosis: [diagnosis]. Current symptoms: [symptoms].',
      objective: 'Physical examination: [findings]. Vital signs: BP [systolic]/[diastolic] mmHg, Pulse [rate] bpm, Temperature [temp]°C, Weight [weight] kg, Height [height] cm.',
      assessment: 'Assessment: [current status]',
      plan: 'Plan: [continued/adjusted treatment]',
      diagnosis: 'Diagnosis: [diagnosis]',
      medications: 'Medications: [current medications]',
      followUp: 'Follow-up: [next appointment]'
    },
    'emergency': {
      name: 'Emergency Visit',
      subjective: 'Emergency presentation: [chief complaint]. Onset: [onset]. Severity: [severity].',
      objective: 'Emergency physical examination: [critical findings]. Vital signs: BP [systolic]/[diastolic] mmHg, Pulse [rate] bpm, Temperature [temp]°C, Weight [weight] kg, Height [height] cm.',
      assessment: 'Assessment: [emergency diagnosis]',
      plan: 'Plan: [emergency treatment]',
      diagnosis: 'Diagnosis: [diagnosis]',
      medications: 'Medications: [emergency medications]',
      followUp: 'Follow-up: [discharge instructions]'
    }
  };

  const fetchPatient = useCallback(async () => {
    if (!patientId) return;
    
    try {
              const response = await fetch(`/api/patients/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPatient(data.patient || data);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  }, [patientId]);

  const fetchNotes = useCallback(async () => {
    if (!patientId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/clinical-notes?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }, [patientId]);

  const fetchDoctors = useCallback(async () => {
    try {
              const response = await fetch('/api/doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || data || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
              const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || data || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('vitalSigns.')) {
      const field = name.split('vitalSigns.')[1];
      setFormData(prev => ({
        ...prev,
        vitalSigns: {
          ...prev.vitalSigns,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientId) newErrors.patientId = 'Patient is required';
    if (!formData.doctorId) newErrors.doctorId = 'Doctor is required';
    if (!formData.visitDate) newErrors.visitDate = 'Visit date is required';
    if (!formData.subjective.trim()) newErrors.subjective = 'Subjective assessment is required';
    if (!formData.objective.trim()) newErrors.objective = 'Objective findings are required';
    if (!formData.assessment.trim()) newErrors.assessment = 'Assessment is required';
    if (!formData.plan.trim()) newErrors.plan = 'Treatment plan is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTemplateSelect = (templateKey) => {
    if (templateKey && soapTemplates[templateKey]) {
      const template = soapTemplates[templateKey];
      setFormData(prev => ({
        ...prev,
        subjective: template.subjective,
        objective: template.objective,
        assessment: template.assessment,
        plan: template.plan,
        diagnosis: template.diagnosis,
        medications: template.medications,
        followUp: template.followUp
      }));
      setSelectedTemplate(templateKey);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const noteData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        noteDate: formData.visitDate,
        subjective: formData.subjective,
        objective: formData.objective,
        assessment: formData.assessment,
        plan: formData.plan,
        diagnosis: formData.diagnosis,
        medications: formData.medications,
        followUp: formData.followUp,
        notes: formData.notes
      };

      const url = currentNote 
        ? `/api/clinical-notes/${currentNote.id}`
        : '/api/clinical-notes';
      
      const method = currentNote ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {

        alert(currentNote ? 'Clinical note updated successfully!' : 'Clinical note created successfully!');

        setCurrentNote(null);
        resetForm();
        fetchNotes();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to save note'}`);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving clinical note');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setCurrentNote(note);
    setFormData({
      patientId: note.patientId || patientId,
      doctorId: note.doctorId || '',
      visitDate: note.noteDate ? new Date(note.noteDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      subjective: note.subjective || '',
      objective: note.objective || '',
      assessment: note.assessment || '',
      plan: note.plan || '',
      vitalSigns: {
        bloodPressure: '',
        pulse: '',
        temperature: '',
        weight: '',
        height: '',
        oxygenSaturation: ''
      },
      physicalExamination: note.physicalExamination || '',
      diagnosis: note.diagnosis || '',
      treatment: note.treatment || '',
      medications: note.medications || '',
      followUp: note.followUp || '',
      notes: note.notes || ''
    });

  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinical note?')) {
      try {
        const response = await fetch(`/api/clinical-notes/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Clinical note deleted successfully!');
          fetchNotes();
        } else {
          alert('Failed to delete note');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: patientId || '',
      doctorId: '',
      visitDate: new Date().toISOString().split('T')[0],
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      vitalSigns: {
        bloodPressure: '',
        pulse: '',
        temperature: '',
        weight: '',
        height: '',
        oxygenSaturation: ''
      },
      physicalExamination: '',
      diagnosis: '',
      treatment: '',
      medications: '',
      followUp: '',
      notes: ''
    });
    setSelectedTemplate('');
    setErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state if no patient and patientId is required
  if (patientId && !patient) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading">Loading patient information...</div>
      </div>
    );
  }

  return (
    <div className="container fade-in-up">
      {/* Enhanced Header */}
      <div className="modern-card hover-scale" style={{ marginBottom: '2rem' }}>
        <div className="modern-card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                background: 'var(--gradient-accent)', 
                borderRadius: 'var(--radius-xl)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.375rem',
                boxShadow: 'var(--shadow-md)'
              }}>
                <FaNotesMedical />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-900)' }}>
                  Clinical Notes
                </h1>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--neutral-600)', fontSize: 'var(--text-lg)', lineHeight: '1.5' }}>
                  Comprehensive SOAP documentation with detailed patient assessment and treatment planning
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/patients')} 
              className="btn-modern btn-modern-secondary hover-lift"
            >
              <FaArrowLeft style={{ fontSize: '0.875rem' }} />
              Back to Patients
            </button>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="modern-card hover-scale" style={{ marginBottom: '2rem' }}>
        <div className="modern-card-header">
          <h2 className="form-modern-title">
            <FaClipboardList style={{ marginRight: '0.75rem' }} />
            SOAP Templates
          </h2>
          <p className="form-modern-subtitle">Select a template to pre-fill the form</p>
        </div>
        <div className="modern-card-body">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {Object.keys(soapTemplates).map(templateKey => (
              <button
                key={templateKey}
                onClick={() => handleTemplateSelect(templateKey)}
                className={`btn-modern ${selectedTemplate === templateKey ? 'btn-modern-primary' : 'btn-modern-secondary'} hover-lift`}
                style={{ minWidth: '150px' }}
              >
                {soapTemplates[templateKey].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="form-modern hover-scale">
        <div className="form-modern-header">
          <h2 className="form-modern-title">
            <FaUser style={{ marginRight: '0.75rem' }} />
            Clinical Note Information
          </h2>
          <p className="form-modern-subtitle">Complete patient assessment and treatment documentation</p>
        </div>
        
        <div className="form-modern-body">
          {/* Patient & Doctor Selection */}
          <div className="grid-modern grid-modern-3">
            <div className="form-group">
              <label className="form-label">
                <FaUser style={{ marginRight: '0.5rem' }} />
                Patient *
              </label>
              <select
                name="patientId"
                className="input-modern focus-ring"
                value={formData.patientId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} - {patient.phone}
                  </option>
                ))}
              </select>
              {errors.patientId && <span style={{ color: 'var(--danger-500)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>{errors.patientId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaUserMd style={{ marginRight: '0.5rem' }} />
                Doctor *
              </label>
              <select
                name="doctorId"
                className="input-modern focus-ring"
                value={formData.doctorId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name || `${doctor.firstName} ${doctor.lastName}`} - {doctor.specialization}
                  </option>
                ))}
              </select>
              {errors.doctorId && <span style={{ color: 'var(--danger-500)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>{errors.doctorId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                Visit Date *
              </label>
              <input
                type="date"
                name="visitDate"
                className="input-modern focus-ring"
                value={formData.visitDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              {errors.visitDate && <span style={{ color: 'var(--danger-500)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>{errors.visitDate}</span>}
            </div>
          </div>

          {/* Vital Signs */}
          <div className="grid-modern grid-modern-5" style={{ marginTop: '2rem' }}>
            <div className="form-group">
              <label className="form-label">
                <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
                Blood Pressure
              </label>
              <input
                type="text"
                name="vitalSigns.bloodPressure"
                className="input-modern focus-ring"
                value={formData.vitalSigns.bloodPressure}
                onChange={handleInputChange}
                placeholder="e.g., 120/80"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaHeartbeat style={{ marginRight: '0.5rem' }} />
                Pulse (bpm)
              </label>
              <input
                type="number"
                name="vitalSigns.pulse"
                className="input-modern focus-ring"
                value={formData.vitalSigns.pulse}
                onChange={handleInputChange}
                placeholder="e.g., 72"
                min="40"
                max="200"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaThermometerHalf style={{ marginRight: '0.5rem' }} />
                Temperature (°F)
              </label>
              <input
                type="number"
                name="vitalSigns.temperature"
                className="input-modern focus-ring"
                value={formData.vitalSigns.temperature}
                onChange={handleInputChange}
                placeholder="e.g., 98.6"
                step="0.1"
                min="95"
                max="110"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaWeight style={{ marginRight: '0.5rem' }} />
                Weight (kg)
              </label>
              <input
                type="number"
                name="vitalSigns.weight"
                className="input-modern focus-ring"
                value={formData.vitalSigns.weight}
                onChange={handleInputChange}
                placeholder="e.g., 70"
                step="0.1"
                min="20"
                max="300"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaRuler style={{ marginRight: '0.5rem' }} />
                Height (cm)
              </label>
              <input
                type="number"
                name="vitalSigns.height"
                className="input-modern focus-ring"
                value={formData.vitalSigns.height}
                onChange={handleInputChange}
                placeholder="e.g., 170"
                min="100"
                max="250"
              />
            </div>
          </div>

          {/* SOAP Documentation */}
          <div className="grid-modern grid-modern-1" style={{ marginTop: '2rem' }}>
            <div className="form-group">
              <label className="form-label">
                <FaUser style={{ marginRight: '0.5rem' }} />
                Subjective (S) *
              </label>
              <textarea
                name="subjective"
                className="input-modern focus-ring"
                value={formData.subjective}
                onChange={handleInputChange}
                placeholder="Patient's chief complaint, history of present illness, past medical history, family history, social history, review of systems"
                rows="4"
                style={{ resize: 'vertical' }}
                required
              />
              {errors.subjective && <span style={{ color: 'var(--danger-500)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>{errors.subjective}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaEye style={{ marginRight: '0.5rem' }} />
                Objective (O) *
              </label>
              <textarea
                name="objective"
                className="input-modern focus-ring"
                value={formData.objective}
                onChange={handleInputChange}
                placeholder="Physical examination findings, vital signs, laboratory results, imaging studies, other diagnostic tests"
                rows="4"
                style={{ resize: 'vertical' }}
                required
              />
              {errors.objective && <span style={{ color: 'var(--danger-500)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>{errors.objective}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaBrain style={{ marginRight: '0.5rem' }} />
                Assessment (A) *
              </label>
              <textarea
                name="assessment"
                className="input-modern focus-ring"
                value={formData.assessment}
                onChange={handleInputChange}
                placeholder="Clinical impression, differential diagnosis, problem list, severity assessment"
                rows="4"
                style={{ resize: 'vertical' }}
                required
              />
              {errors.assessment && <span style={{ color: 'var(--danger-500)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>{errors.assessment}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaCheckCircle style={{ marginRight: '0.5rem' }} />
                Plan (P) *
              </label>
              <textarea
                name="plan"
                className="input-modern focus-ring"
                value={formData.plan}
                onChange={handleInputChange}
                placeholder="Treatment plan, medications, procedures, follow-up schedule, patient education, referrals"
                rows="4"
                style={{ resize: 'vertical' }}
                required
              />
              {errors.plan && <span style={{ color: 'var(--danger-500)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>{errors.plan}</span>}
            </div>
          </div>

          {/* Additional Clinical Information */}
          <div className="grid-modern grid-modern-2" style={{ marginTop: '2rem' }}>
            <div className="form-group">
              <label className="form-label">
                <FaStethoscope style={{ marginRight: '0.5rem' }} />
                Physical Examination
              </label>
              <textarea
                name="physicalExamination"
                className="input-modern focus-ring"
                value={formData.physicalExamination}
                onChange={handleInputChange}
                placeholder="Detailed physical examination findings, system-by-system assessment"
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaBrain style={{ marginRight: '0.5rem' }} />
                Diagnosis
              </label>
              <textarea
                name="diagnosis"
                className="input-modern focus-ring"
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Primary and secondary diagnoses, ICD codes if applicable"
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaStethoscope style={{ marginRight: '0.5rem' }} />
                Treatment
              </label>
              <textarea
                name="treatment"
                className="input-modern focus-ring"
                value={formData.treatment}
                onChange={handleInputChange}
                placeholder="Treatment modalities, procedures performed, interventions"
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaPills style={{ marginRight: '0.5rem' }} />
                Medications
              </label>
              <textarea
                name="medications"
                className="input-modern focus-ring"
                value={formData.medications}
                onChange={handleInputChange}
                placeholder="Prescribed medications, dosages, frequency, duration"
                rows="4"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                Follow-up Plan
              </label>
              <textarea
                name="followUp"
                className="input-modern focus-ring"
                value={formData.followUp}
                onChange={handleInputChange}
                placeholder="Follow-up schedule, next appointment, monitoring requirements, patient instructions"
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                <FaNotesMedical style={{ marginRight: '0.5rem' }} />
                Additional Notes
              </label>
              <textarea
                name="notes"
                className="input-modern focus-ring"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional clinical observations, special considerations, or notes"
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1.5rem', 
          marginTop: '3rem',
          padding: '2.5rem',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--neutral-100)',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="btn-modern btn-modern-secondary hover-lift"
            disabled={loading}
          >
            <FaTimes style={{ fontSize: '0.875rem' }} />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-modern btn-modern-primary hover-lift"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-modern" style={{ width: '16px', height: '16px' }}></div>
            ) : (
              <FaSave style={{ fontSize: '0.875rem' }} />
            )}
            {loading ? 'Saving...' : (currentNote ? 'Update Clinical Note' : 'Save Clinical Note')}
          </button>
        </div>
      </form>

      {/* Clinical Notes History */}
      {notes.length > 0 && (
        <div className="modern-card hover-scale" style={{ marginTop: '3rem' }}>
          <div className="modern-card-header">
            <h2 className="form-modern-title">
              <FaHistory style={{ marginRight: '0.75rem' }} />
              Clinical Notes History
            </h2>
            <p className="form-modern-subtitle">Previous clinical notes for this patient</p>
          </div>
          <div className="modern-card-body">
            <div className="table-modern">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map(note => (
                    <tr key={note.id}>
                      <td>{formatDate(note.noteDate)}</td>
                      <td>{note.doctorName || `Dr. ${note.doctorId}`}</td>
                      <td>{note.diagnosis || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(note)}
                            className="btn-modern btn-modern-secondary btn-modern-sm"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="btn-modern btn-modern-danger btn-modern-sm"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalNotes;
