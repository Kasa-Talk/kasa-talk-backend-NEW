const express = require('express');
const Kataroute = require('./kata.route');
const userRouter = require('./user.route');
const { errorrHandling } = require('../controllers/auth-Error.controller');

const route = express.Router();

route.use('*', errorrHandling);
route.use('*', (req, res) => {
  res.status(403).json({
    errors: ['Page Not Found'],
    message: 'Forbidden',
    data: null,
  });
});
route.use('/api', userRouter);
route.use('/api', Kataroute);

module.exports = route;
