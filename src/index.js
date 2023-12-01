const express = require('express');
const appMiddleware = require('./middleware');
const { User } = require('./models');

const app = express();
const PORT = 3000;

// middleware untuk menghandle body json
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  const data = await User.findAll();
  res.json(data);
});

app.use(appMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
