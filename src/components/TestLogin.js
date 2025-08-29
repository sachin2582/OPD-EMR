import React from 'react';

const TestLogin = () => {
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
      <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🔐 LOGIN TEST</h1>
      <p style={{ fontSize: '1.5rem', margin: '0 0 2rem 0', opacity: 0.9 }}>
        If you can see this, routing is working!
      </p>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.2)', 
        padding: '2rem', 
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        maxWidth: '500px'
      }}>
        <h2>✅ Login Component Loaded</h2>
        <p>This confirms that:</p>
        <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
          <li>✅ React is working</li>
          <li>✅ Routing is working</li>
          <li>✅ Component rendering is working</li>
        </ul>
        <p style={{ marginTop: '1rem' }}>
          <strong>Current URL:</strong> {window.location.href}
        </p>
      </div>
    </div>
  );
};

export default TestLogin;
