const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

// Mock login
app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, message: 'Login successful' });
});

// Mock clinic data
app.get('/api/clinic', (req, res) => {
  res.json({
    clinicName: 'OPD-EMR HOSPITAL',
    address: '123 Medical Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '+91-22-12345678',
    email: 'info@opdemr.com'
  });
});

// Mock patient data
app.get('/api/patients/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: 'John Doe',
    age: 35,
    gender: 'Male'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});