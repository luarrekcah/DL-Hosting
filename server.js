const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.sendStatus(200);
});

require('./start.js')

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor ON`);
});