const express = require('express');
const app = express();
const PORT = 5000;

app.get('/test', (req, res) => {
  res.json({ message: 'Express server working!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
