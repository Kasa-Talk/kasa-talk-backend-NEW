const express = require('express');
const Kataroute = require('./kata.route');
const userRouter = require('./user.route');
const { errorrHandling } = require('../controllers/auth-Error.controller');

const route = express.Router();

route.use('/api', userRouter);
route.use('/api', Kataroute);

route.use('*', errorrHandling);
route.use('*', (req, res) => {
  res.status(200).json({
    errors: [],
    message: 'Success',
    data: null,
  });
});

module.exports = route;
