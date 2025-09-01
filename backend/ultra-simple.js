const express = require('express');
const app = express();
const PORT = 5001;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Ultra simple server working!' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint working!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Ultra simple server on port ${PORT}`);
});
