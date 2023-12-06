const express = require('express');
const userRouter = require('./user.route');
const wordRouter = require('./word.route');
const { errorrHandling } = require('../controllers/auth-Error.controller');
const { statistikRouter } = require('./statistik.route');

const route = express.Router();

route.use('/api', userRouter);
route.use('/api', wordRouter);
route.use('/api', statistikRouter);

route.use('*', errorrHandling);
route.use('*', (req, res) => {
  res.status(200).json({
    errors: [],
    message: 'Success',
    data: null,
  });
});

module.exports = route;
