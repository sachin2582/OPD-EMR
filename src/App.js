import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

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
// Pharmacy Module Imports
import PharmacyDashboard from './components/pharmacy/PharmacyDashboard';
import PharmacyPOS from './components/pharmacy/POS/PharmacyPOS';
import PurchaseManagement from './components/pharmacy/Purchases/PurchaseManagement';
import ReturnsManagement from './components/pharmacy/Returns/ReturnsManagement';
import PharmacyReports from './components/pharmacy/Reports/PharmacyReports';
import './styles/MasterTheme.css';
import './styles/GlobalComponents.css';
import './App.css';

// Create a custom theme for medical/EMR applications
const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6F7FF',
      100: '#BAE7FF',
      200: '#91D5FF',
      300: '#69C0FF',
      400: '#40A9FF',
      500: '#1890FF',
      600: '#096DD9',
      700: '#0050B3',
      800: '#003A8C',
      900: '#002766',
    },
    medical: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
    }
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'medical',
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router future={{ v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* All other routes wrapped in AppLayout */}
            <Route path="/dashboard" element={
              <AppLayout>
                <Dashboard />
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
          </Routes>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
