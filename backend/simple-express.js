const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Simple Express server is running on port 5000!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Express server running on port ${PORT}`);
  console.log(`✅ Test endpoint: http://localhost:${PORT}/test`);
});

// Error handling
app.on('error', (error) => {
  console.error('Server error:', error);
});
