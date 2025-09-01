const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Basic auth endpoint that always returns 200 (for health check)
app.post('/api/auth/login', (req, res) => {
  res.status(200).json({ message: 'Backend is available' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Health check server is working!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Health check server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
});
