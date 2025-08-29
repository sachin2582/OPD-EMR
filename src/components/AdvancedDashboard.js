import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdvancedDashboard = () => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserData(user);
    }
    
    // Mock system stats
    setSystemStats({
      totalPatients: 1250,
      activePatients: 890,
      todayAppointments: 45,
      pendingPrescriptions: 23,
      revenue: 125000,
      growthRate: 12.5,
      systemHealth: 98.5
    });
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>Loading advanced dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', color: '#333', margin: '0 0 8px 0' }}>
                🏥 Advanced EMR Dashboard
              </h1>
              <p style={{ color: '#666', margin: 0 }}>
                Welcome back, {userData.name || userData.username || 'Doctor'}! Here's your practice overview
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button style={{ padding: '8px 16px', border: '1px solid #007bff', backgroundColor: 'white', color: '#007bff', borderRadius: '4px' }}>
                🔔 Notifications (3)
              </button>
              <button style={{ padding: '8px 16px', border: '1px solid #6c757d', backgroundColor: 'white', color: '#6c757d', borderRadius: '4px' }}>
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <button 
              style={{ padding: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => navigate('/add-patient')}
            >
              ➕ Add Patient
            </button>
            <button 
              style={{ padding: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => navigate('/appointments')}
            >
              📅 Schedule
            </button>
            <button 
              style={{ padding: '16px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => navigate('/e-prescription')}
            >
              💊 E-Prescription
            </button>
            <button 
              style={{ padding: '16px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => navigate('/lab-tests')}
            >
              🧪 Lab Tests
            </button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Left Column - Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Key Performance Indicators */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', color: '#007bff', margin: '0 0 16px 0' }}>
                📊 Key Performance Indicators
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>{systemStats.totalPatients}</div>
                  <div style={{ color: '#666' }}>Total Patients</div>
                  <div style={{ color: '#28a745', fontSize: '14px' }}>↗️ +12.5%</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{systemStats.todayAppointments}</div>
                  <div style={{ color: '#666' }}>Today's Appointments</div>
                  <div style={{ color: '#28a745', fontSize: '14px' }}>↗️ +8.2%</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fd7e14' }}>₹{systemStats.revenue.toLocaleString()}</div>
                  <div style={{ color: '#666' }}>Revenue (₹)</div>
                  <div style={{ color: '#28a745', fontSize: '14px' }}>↗️ +15.3%</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6f42c1' }}>{systemStats.systemHealth}%</div>
                  <div style={{ color: '#666' }}>System Health</div>
                  <div style={{ color: '#28a745', fontSize: '14px' }}>↗️ +2.1%</div>
                </div>
              </div>
            </div>

            {/* Real-time Patient Monitoring */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', color: '#007bff', margin: '0 0 16px 0' }}>
                ❤️ Real-time Patient Monitoring
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', color: '#fd7e14', marginBottom: '8px' }}>🌡️</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>24</div>
                  <div style={{ color: '#666' }}>Patients in Queue</div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', marginTop: '8px' }}>
                    <div style={{ width: '60%', height: '100%', backgroundColor: '#fd7e14', borderRadius: '4px' }}></div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', color: '#28a745', marginBottom: '8px' }}>👨‍⚕️</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>8</div>
                  <div style={{ color: '#666' }}>Currently Consulting</div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', marginTop: '8px' }}>
                    <div style={{ width: '40%', height: '100%', backgroundColor: '#28a745', borderRadius: '4px' }}></div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', color: '#007bff', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>13</div>
                  <div style={{ color: '#666' }}>Completed Today</div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', marginTop: '8px' }}>
                    <div style={{ width: '65%', height: '100%', backgroundColor: '#007bff', borderRadius: '4px' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', color: '#007bff', margin: '0 0 16px 0' }}>
                ⏰ Recent Activity
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px' }}>👤</span>
                    <div>
                      <div style={{ fontWeight: '500' }}>Patient registered</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>John Doe</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>2 minutes ago</div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px' }}>💊</span>
                    <div>
                      <div style={{ fontWeight: '500' }}>Prescription created</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Jane Smith</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>15 minutes ago</div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px' }}>📅</span>
                    <div>
                      <div style={{ fontWeight: '500' }}>Appointment scheduled</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Mike Johnson</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>1 hour ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* System Status */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', color: '#007bff', margin: '0 0 16px 0' }}>
                🖥️ System Status
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#28a745' }}>💾</span>
                    <span>Database</span>
                  </div>
                  <span style={{ padding: '4px 8px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', fontSize: '12px' }}>Online</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#28a745' }}>🌐</span>
                    <span>API Services</span>
                  </div>
                  <span style={{ padding: '4px 8px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', fontSize: '12px' }}>Online</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#28a745' }}>☁️</span>
                    <span>File Storage</span>
                  </div>
                  <span style={{ padding: '4px 8px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', fontSize: '12px' }}>Online</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#28a745' }}>🛡️</span>
                    <span>Security</span>
                  </div>
                  <span style={{ padding: '4px 8px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', fontSize: '12px' }}>Protected</span>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', color: '#007bff', margin: '0 0 16px 0' }}>
                💡 Quick Insights
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#1976d2' }}>ℹ️</span>
                    <span style={{ fontSize: '14px' }}>
                      Peak consultation hours: 10 AM - 2 PM
                    </span>
                  </div>
                </div>
                
                <div style={{ padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#2e7d32' }}>✅</span>
                    <span style={{ fontSize: '14px' }}>
                      Patient satisfaction: 94.2%
                    </span>
                  </div>
                </div>
                
                <div style={{ padding: '12px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#f57c00' }}>⚠️</span>
                    <span style={{ fontSize: '14px' }}>
                      Average wait time: 18 minutes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
