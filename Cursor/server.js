const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the To-Do API!');
});

app.listen(port, () => {
  console.log(`To-Do API listening at http://localhost:${port}`);
});