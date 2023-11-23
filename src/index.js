const express = require('express');

const app = express();
const PORT = 3000;

// routes
const { Kataroute } = require('./routes/index');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/kata', Kataroute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
