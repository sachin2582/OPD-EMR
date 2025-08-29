import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUserInjured, 
  FaCalendarAlt, 
  FaNotesMedical, 
  FaPills,
  FaPlus,
  FaPrescriptionBottle
} from 'react-icons/fa';

const Dashboard = () => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserData(user);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
        <div style={{textAlign: 'center'}}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: 'var(--primary-600)'}}></div>
          <p style={{color: 'var(--neutral-600)'}}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="master-card mb-6">
        <div className="card-content">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div>
              <h2 style={{fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-2)', color: 'var(--neutral-900)'}}>
                Welcome back, {userData.name || userData.username || 'Doctor'}! 👋
              </h2>
              <p style={{color: 'var(--neutral-600)'}}>
                Here's what's happening in your practice today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="master-grid master-grid-5 mb-8">
        <div className="master-card">
          <div className="card-content">
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)'}}>
              <div style={{width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-100)'}}>
                <FaUserInjured style={{fontSize: 'var(--font-size-xl)', color: 'var(--primary-600)'}} />
              </div>
              <div>
                <h3 style={{fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-900)'}}>0</h3>
                <p style={{color: 'var(--neutral-600)'}}>Total Patients</p>
                <span style={{color: 'var(--success-600)', fontSize: 'var(--font-size-sm)'}}>+0% from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="master-card">
          <div className="card-content">
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)'}}>
              <div style={{width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--success-100)'}}>
                <FaCalendarAlt style={{fontSize: 'var(--font-size-xl)', color: 'var(--success-600)'}} />
              </div>
              <div>
                <h3 style={{fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-900)'}}>0</h3>
                <p style={{color: 'var(--neutral-600)'}}>Today's Appointments</p>
                <span style={{color: 'var(--success-600)', fontSize: 'var(--font-size-sm)'}}>+0% from yesterday</span>
              </div>
            </div>
          </div>
        </div>

        <div className="master-card">
          <div className="card-content">
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)'}}>
              <div style={{width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--warning-100)'}}>
                <FaNotesMedical style={{fontSize: 'var(--font-size-xl)', color: 'var(--warning-600)'}} />
              </div>
              <div>
                <h3 style={{fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-900)'}}>0</h3>
                <p style={{color: 'var(--neutral-600)'}}>Clinical Notes</p>
                <span style={{color: 'var(--success-600)', fontSize: 'var(--font-size-sm)'}}>+0% from last week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="master-card">
          <div className="card-content">
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)'}}>
              <div style={{width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-100)'}}>
                <FaPills style={{fontSize: 'var(--font-size-xl)', color: 'var(--primary-600)'}} />
              </div>
              <div>
                <h3 style={{fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-900)'}}>0</h3>
                <p style={{color: 'var(--neutral-600)'}}>Prescriptions</p>
                <span style={{color: 'var(--success-600)', fontSize: 'var(--font-size-sm)'}}>+0% from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pharmacy Module Card */}
        <div className="master-card">
          <div className="card-content">
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)'}}>
              <div style={{width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--success-100)'}}>
                <FaPrescriptionBottle style={{fontSize: 'var(--font-size-xl)', color: 'var(--success-600)'}} />
              </div>
              <div>
                <h3 style={{fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--neutral-900)'}}>🏥</h3>
                <p style={{color: 'var(--neutral-600)'}}>Pharmacy</p>
                <Link to="/pharmacy" style={{color: 'var(--success-600)', fontSize: 'var(--font-size-sm)', textDecoration: 'none'}}>
                  Access Pharmacy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="master-grid master-grid-2 gap-6">
        <div className="master-card">
          <div className="card-header">
            <h3 className="card-title">Recent Patients</h3>
            <Link to="/patients" style={{color: 'var(--primary-600)', fontSize: 'var(--font-size-sm)'}}>
              View All
            </Link>
          </div>
          <div className="card-content">
            <div style={{textAlign: 'center', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-8)'}}>
              <FaUserInjured style={{fontSize: 'var(--font-size-4xl)', marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--spacing-4)', color: 'var(--neutral-400)'}} />
              <p style={{marginBottom: 'var(--spacing-4)', color: 'var(--neutral-600)'}}>No patients yet</p>
              <div style={{display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'center'}}>
                <Link to="/add-patient" className="master-btn master-btn-primary master-btn-sm">
                  Add First Patient
                </Link>
                <Link to="/patient-dashboard" className="master-btn master-btn-secondary master-btn-sm">
                  View Sample Patient
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="master-card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Appointments</h3>
            <Link to="/appointments" style={{color: 'var(--primary-600)', fontSize: 'var(--font-size-sm)'}}>
              View All
            </Link>
          </div>
          <div className="card-content">
            <div style={{textAlign: 'center', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-8)'}}>
              <FaCalendarAlt style={{fontSize: 'var(--font-size-4xl)', marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--spacing-4)', color: 'var(--neutral-400)'}} />
              <p style={{marginBottom: 'var(--spacing-4)', color: 'var(--neutral-600)'}}>No appointments scheduled</p>
              <Link to="/appointments" className="master-btn master-btn-primary master-btn-sm">
                Schedule Appointment
              </Link>
            </div>
          </div>
        </div>

        {/* Pharmacy Quick Actions */}
        <div className="master-card">
          <div className="card-header">
            <h3 className="card-title">Pharmacy Operations</h3>
            <Link to="/pharmacy" style={{color: 'var(--primary-600)', fontSize: 'var(--font-size-sm)'}}>
              View All
            </Link>
          </div>
          <div className="card-content">
            <div style={{textAlign: 'center', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-8)'}}>
              <FaPrescriptionBottle style={{fontSize: 'var(--font-size-4xl)', marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--spacing-4)', color: 'var(--neutral-400)'}} />
              <p style={{marginBottom: 'var(--spacing-4)', color: 'var(--neutral-600)'}}>Manage pharmacy operations</p>
              <div style={{display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'center', flexWrap: 'wrap'}}>
                <Link to="/pharmacy/pos" className="master-btn master-btn-primary master-btn-sm">
                  🏥 POS
                </Link>
                <Link to="/pharmacy/purchases" className="master-btn master-btn-secondary master-btn-sm">
                  📦 Purchases
                </Link>
                <Link to="/pharmacy/returns" className="master-btn master-btn-secondary master-btn-sm">
                  🔄 Returns
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="master-card mt-6">
        <div className="card-header">
          <h3 className="card-title">System Status</h3>
        </div>
        <div className="card-content">
          <div className="master-grid master-grid-4 gap-4">
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--neutral-50)'}}>
              <span style={{fontWeight: 'var(--font-weight-medium)', color: 'var(--neutral-700)'}}>Database</span>
              <span className="master-badge badge-success">Online</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--neutral-50)'}}>
              <span style={{fontWeight: 'var(--font-weight-medium)', color: 'var(--neutral-700)'}}>API Services</span>
              <span className="master-badge badge-success">Online</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--neutral-50)'}}>
              <span style={{fontWeight: 'var(--font-weight-medium)', color: 'var(--neutral-700)'}}>File Storage</span>
              <span className="master-badge badge-success">Online</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--neutral-50)'}}>
              <span style={{fontWeight: 'var(--font-weight-medium)', color: 'var(--neutral-700)'}}>Backup System</span>
              <span className="master-badge badge-success">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
