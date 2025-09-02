import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ChakraUIProvider } from './ChakraProvider';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PatientForm from './components/PatientForm';
import PatientView from './components/PatientView';
import AppointmentScheduler from './components/AppointmentScheduler';
import DoctorDashboard from './components/DoctorDashboard';
import ClinicalNotes from './components/ClinicalNotes';
import EPrescription from './components/EPrescription';
import Billing from './components/Billing';
import LabTestManagement from './components/LabTestManagement';
import LabTestBilling from './components/LabTestBilling';
import PatientDashboard from './components/PatientDashboard';
import AppLayout from './components/AppLayout';
import AdvancedDashboard from './components/AdvancedDashboard';
import SmartAppointmentScheduler from './components/SmartAppointmentScheduler';
import ClinicSetup from './components/ClinicSetup';
// Pharmacy Module Imports
import PharmacyDashboard from './components/pharmacy/PharmacyDashboard';
import PharmacyPOS from './components/pharmacy/POS/PharmacyPOS';
import PurchaseManagement from './components/pharmacy/Purchases/PurchaseManagement';
import ReturnsManagement from './components/pharmacy/Returns/ReturnsManagement';
import PharmacyReports from './components/pharmacy/Reports/PharmacyReports';
import './styles/MasterTheme.css';
import './styles/GlobalComponents.css';
import './App.css';

// Component to redirect users who access e-prescription without a patient ID
const EPrescriptionRedirect = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>E-Prescription</h2>
      <p>Please select a patient from the Doctor Dashboard to create a prescription.</p>
      <button 
        onClick={() => navigate('/doctor')}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#2563eb', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer' 
        }}
      >
        Go to Doctor Dashboard
      </button>
    </div>
  );
};

function App() {
  return (
    <ChakraUIProvider>
      <Router future={{ v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* All other routes wrapped in AppLayout */}
            <Route path="/dashboard" element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            } />
            <Route path="/advanced-dashboard" element={
              <AppLayout>
                <AdvancedDashboard />
              </AppLayout>
            } />
            <Route path="/smart-appointments" element={
              <AppLayout>
                <SmartAppointmentScheduler />
              </AppLayout>
            } />
            <Route path="/add-patient" element={
              <AppLayout>
                <PatientForm />
              </AppLayout>
            } />
              <Route path="/patients" element={
                <AppLayout>
                  <PatientList />
                </AppLayout>
              } />
              <Route path="/patient/:id" element={
                <AppLayout>
                  <PatientView />
                </AppLayout>
              } />
              <Route path="/appointments" element={
                <AppLayout>
                  <AppointmentScheduler />
                </AppLayout>
              } />
              <Route path="/doctor" element={
                <AppLayout>
                  <DoctorDashboard />
                </AppLayout>
              } />
              <Route path="/clinical-notes/:patientId" element={
                <AppLayout>
                  <ClinicalNotes />
                </AppLayout>
              } />
              <Route path="/e-prescription/:patientId" element={
                <AppLayout>
                  <EPrescription />
                </AppLayout>
              } />
              <Route path="/e-prescription" element={
                <AppLayout>
                  <EPrescriptionRedirect />
                </AppLayout>
              } />
              <Route path="/billing" element={
                <AppLayout>
                  <Billing />
                </AppLayout>
              } />
              <Route path="/lab-tests" element={
                <AppLayout>
                  <LabTestManagement />
                </AppLayout>
              } />
              <Route path="/lab-billing" element={
                <AppLayout>
                  <LabTestBilling />
                </AppLayout>
              } />
              <Route path="/patient-dashboard" element={
                <AppLayout>
                  <PatientDashboard />
                </AppLayout>
              } />
              
              {/* Pharmacy Module Routes */}
              <Route path="/pharmacy" element={
                <AppLayout>
                  <PharmacyDashboard />
                </AppLayout>
              } />
              <Route path="/pharmacy/pos" element={
                <AppLayout>
                  <PharmacyPOS />
                </AppLayout>
              } />
              <Route path="/pharmacy/purchases" element={
                <AppLayout>
                  <PurchaseManagement />
                </AppLayout>
              } />
              <Route path="/pharmacy/returns" element={
                <AppLayout>
                  <ReturnsManagement />
                </AppLayout>
              } />
              <Route path="/pharmacy/reports" element={
                <AppLayout>
                  <PharmacyReports />
                </AppLayout>
              } />
              
              {/* Clinic Setup Route */}
              <Route path="/clinic-setup" element={
                <AppLayout>
                  <ClinicSetup />
                </AppLayout>
              } />
            </Routes>
          </div>
        </Router>
    </ChakraUIProvider>
  );
}

export default App;
