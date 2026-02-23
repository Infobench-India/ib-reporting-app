const express = require('express');
const path = require('path');
const app = express();
const port = 5003;

const buildPath = path.join(__dirname, 'dist');
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://192.168.2.20:5000'); // Allow all origins
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');
  next();
});
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Infobench Container UI served at http://localhost:${port}`);
});
