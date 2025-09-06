import React from 'react';
import { useLocation } from 'react-router-dom';
import MasterLayout from './MasterLayout';

const AppLayout = ({ children, title, subtitle, actions }) => {
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      /*case '/add-patient':
        return 'Add New Patient';*/
     /* case '/patients':
        return 'Patients';*/
      /*case '/appointments':
        return 'Appointments';*/
      case '/doctor':
        return 'Doctor Dashboard';
      case '/e-prescription':
        return 'E-Prescription';
      case '/lab-tests':
        return 'Lab Tests';
      /*case '/lab-billing':
        return 'Lab Test Billing';*/
      case '/billing':
        return 'Billing';
      case '/bills-view':
        return 'Bills View';
      case '/patient-dashboard':
        return 'Patient Dashboard';
      // Pharmacy Module Titles
      case '/pharmacy':
        return 'Pharmacy Dashboard';
      case '/pharmacy/pos':
        return 'Pharmacy POS';
      case '/pharmacy/purchases':
        return 'Purchase Management';
      case '/pharmacy/returns':
        return 'Returns Management';
      case '/pharmacy/reports':
        return 'Pharmacy Reports';
      /*default:
        return 'OPD-EMR';*/
    }
  };

  const getPageSubtitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Here\'s what\'s happening in your practice today';
      /*case '/add-patient':
        return 'Add a new patient to your system hhhhhh';*/
     
      /*case '/appointments':
        return 'Schedule and manage appointments';*/
      /*case '/doctor':
        return 'Doctor dashboard and patient management';*/
      case '/e-prescription':
        return 'Create and manage electronic prescriptions';
      case '/lab-tests':
        return 'Order and track laboratory tests';
      case '/lab-billing':
        return 'Generate bills for lab test prescriptions';
      case '/billing':
        return 'Manage billing and payments';
      case '/patient-dashboard':
        return 'Patient information and records';
      // Pharmacy Module Subtitles
      case '/pharmacy':
        return 'Manage pharmacy operations and inventory';
      case '/pharmacy/pos':
        return 'Point of sale system for pharmacy transactions';
      case '/pharmacy/purchases':
        return 'Manage purchase orders and supplier relationships';
      case '/pharmacy/returns':
        return 'Handle sales returns and supplier returns';
      case '/pharmacy/reports':
        return 'Generate comprehensive pharmacy reports';
      default:
        return '';
    }
  };

  const getPageActions = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return (
          <div style={{display: 'flex', gap: 'var(--spacing-4)'}}>
            <a href="/add-patient" className="master-btn master-btn-primary">
              + New Patient
            </a>
            <a href="/appointments" className="master-btn master-btn-secondary">
              Schedule
            </a>
          </div>
        );
      /*case '/patients':
        return null;*/
        /*case '/appointments':
          return (
            <div style={{display: 'flex', gap: 'var(--spacing-4)'}>
              <a href="/appointments" className="master-btn master-btn-primary">
                + New Appointment
              </a>
            </div>
          );*/  
      case '/lab-tests':
        return (
          <div style={{display: 'flex', gap: 'var(--spacing-4)'}}>
            <a href="/lab-tests" className="master-btn master-btn-primary">
              + Order Test
            </a>
          </div>
        );
      // Pharmacy Module Actions
      case '/pharmacy':
        return (
          <div style={{display: 'flex', gap: 'var(--spacing-4)'}}>
            <a href="/pharmacy/pos" className="master-btn master-btn-primary">
              🏥 POS
            </a>
            <a href="/pharmacy/purchases" className="master-btn master-btn-secondary">
              📦 Purchases
            </a>
          </div>
        );
      case '/pharmacy/pos':
        return (
          <div style={{display: 'flex', gap: 'var(--spacing-4)'}}>
            <a href="/pharmacy" className="master-btn master-btn-secondary">
              ← Dashboard
            </a>
          </div>
        );
      case '/pharmacy/purchases':
        return (
          <div style={{display: 'flex', gap: 'var(--spacing-4)'}}>
            <a href="/pharmacy" className="master-btn master-btn-secondary">
              ← Dashboard
            </a>
          </div>
        );
      case '/pharmacy/returns':
        return (
          <div style={{display: 'flex', gap: 'var(--spacing-4)'}}>
            <a href="/pharmacy" className="master-btn master-btn-secondary">
              ← Dashboard
            </a>
          </div>
        );
      case '/pharmacy/reports':
        return (
          <div style={{display: 'flex', gap: 'var(--spacing-4)'}}>
            <a href="/pharmacy" className="master-btn master-btn-secondary">
              ← Dashboard
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MasterLayout
      title={getPageTitle()}
      subtitle={getPageSubtitle()}
      actions={getPageActions()}
    >
      {children}
    </MasterLayout>
  );
};

export default AppLayout;
