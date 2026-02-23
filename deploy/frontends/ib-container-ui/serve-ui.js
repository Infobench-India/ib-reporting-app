const express = require('express');
const path = require('path');
const app = express();
const port = 5000;

const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Infobench Container UI served at http://localhost:${port}`);
});
