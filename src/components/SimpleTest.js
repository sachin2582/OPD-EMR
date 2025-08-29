import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🏥 OPD-EMR</h1>
      <p style={{ fontSize: '1.5rem', margin: '0 0 2rem 0', opacity: 0.9 }}>
        System is Working!
      </p>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.2)', 
        padding: '2rem', 
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2>✅ Frontend is Running</h2>
        <p>If you can see this, React routing is working correctly.</p>
        <p>Current URL: {window.location.href}</p>
      </div>
    </div>
  );
};

export default SimpleTest;
