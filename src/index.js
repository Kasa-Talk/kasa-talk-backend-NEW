require('dotenv').config();
const PORT = process.env.PORT || 3000;

const express = require('express');
const app = express();

// routes
const kataRoute = require('./routes/kata.route');


app.use('/kata', kataRoute);


app.listen(PORT, () => {
  console.log(`app listen to http://localhost:${PORT}`)
})