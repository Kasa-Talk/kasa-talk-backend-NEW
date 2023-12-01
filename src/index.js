const express = require('express');
const appMiddleware = require('./middleware');

const app = express();
const PORT = 3000;

// middleware untuk menghandle body json
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(appMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
