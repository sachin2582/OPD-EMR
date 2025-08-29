const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Server is running on port 5001!',
    timestamp: new Date().toISOString(),
    status: 'success',
    features: [
      'Sample Collection Management',
      'Sample Processing & Quality Control',
      'Test Order Management',
      'Result Entry & Verification',
      'Report Generation & Approval',
      'Complete Workflow Tracking',
      'Lab Billing Integration'
    ]
  }));
});

server.listen(5001, () => {
  console.log('🚀 LIMS Server running on port 5001');
  console.log('✅ Test: http://localhost:5001');
  console.log('✅ Dashboard: http://localhost:5001/dashboard');
});

server.on('error', (error) => {
  console.error('Server error:', error);
});
