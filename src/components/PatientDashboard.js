import React, { useState } from 'react';
import { FaPrint, FaEnvelope, FaSms } from 'react-icons/fa';
import MasterLayout from './MasterLayout';

const PatientDashboard = () => {
  const [patientData] = useState({
    name: 'Mr. Ramesh Chandra',
    age: 48,
    gender: 'Male',
    patientId: '0000098758',
    height: '182 cm',
    diagnosis: 'TYPE 2 DM, HYPERTENSION',
    chiefComplaints: 'DECREASED SLEEP',
    labResults: [
      { label: 'Post Prandial Blood Sugar (PPBS)', value: '170' },
      { label: 'Random Blood Sugar - RBS', value: '62' },
      { label: 'Serum Sodium (Na+)', value: '126.5' },
      { label: 'Serum Potassium (K+)', value: '4.25' }
    ],
    prescriptions: [
      {
        medicine: 'SOFTOLAX SF POWDER SAUNF',
        dose: '0-0-1',
        timing: 'After Dinner',
        frequency: 'daily',
        duration: '60 Days',
        note: 'WITH WATER'
      },
      {
        medicine: 'CRESAR CT 40/6.25MG TAB',
        dose: '1-0-1',
        timing: 'After Food',
        frequency: 'daily',
        duration: '30 Days',
        note: 'RIGHT AFTER FOOD'
      },
      {
        medicine: 'DYNAGLIPT 20MG TABLET',
        dose: '1-0-0',
        timing: 'After Breakfast',
        frequency: 'daily',
        duration: '30 Days',
        note: 'RIGHT AFTER FOOD'
      },
      {
        medicine: 'REMO V 50 MG/100 MG TABLET',
        dose: '1-0-0',
        timing: 'After Breakfast',
        frequency: 'daily',
        duration: '30 Days',
        note: 'RIGHT AFTER FOOD'
      }
    ],
    visitDetails: 'Visit Added on: 09-Feb-2022 03-Dec-2021 By: Dr. Argha Chakraborty'
  });

  return (
    <MasterLayout 
      title="Patient Dashboard"
      subtitle="Patient Information & Medical Records"
      showPatientSidebar={true}
      patientData={patientData}
    >
      {/* Patient Header */}
      <div className="patient-header">
        <div className="patient-info">
          <div className="patient-details">
            <h1 className="patient-name">{patientData.name}</h1>
            <div className="patient-meta">
              <span>{patientData.age}y</span>
              <span>|</span>
              <span>{patientData.gender}</span>
              <span className="patient-id">{patientData.patientId}</span>
            </div>
          </div>
          <div className="consultation-actions">
            <button className="btn-connect">Online Connect</button>
            <button className="btn-end">End Consultation</button>
          </div>
        </div>
      </div>

      {/* Lab Results */}
      <div className="lab-results">
        <h3>Lab Results</h3>
        {patientData.labResults.map((lab, index) => (
          <div key={index} className="lab-value">
            <span className="lab-label">{lab.label}</span>
            <span className="lab-number">{lab.value}</span>
          </div>
        ))}
      </div>

      {/* Visit Details */}
      <div className="visit-details">
        {patientData.visitDetails}
      </div>

      {/* Vitals */}
      <div className="vitals-section">
        <h3>Vitals</h3>
        <p>Height {patientData.height}</p>
      </div>

      {/* Diagnosis */}
      <div className="diagnosis-section">
        <h3>Diagnosis</h3>
        <p>{patientData.diagnosis}</p>
      </div>

      {/* Chief Complaints */}
      <div className="complaints-section">
        <h3>Chief Complaints</h3>
        <p>{patientData.chiefComplaints}</p>
      </div>

      {/* Prescription */}
      <div className="prescription-table">
        <h3>Prescription (Rx)</h3>
        <table>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Dose</th>
              <th>Timing</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {patientData.prescriptions.map((prescription, index) => (
              <tr key={index}>
                <td>{prescription.medicine}</td>
                <td>{prescription.dose}</td>
                <td>{prescription.timing}</td>
                <td>{prescription.frequency}</td>
                <td>{prescription.duration}</td>
                <td>{prescription.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-btn">
          <FaEnvelope />
          Email
        </button>
        <button className="action-btn">
          <FaSms />
          SMS
        </button>
        <button className="action-btn">
          <FaPrint />
          Print
        </button>
      </div>
    </MasterLayout>
  );
};

export default PatientDashboard;
