const express = require('express');
const Kataroute = require('./kata.route');
const userRouter = require('./user.route');

const route = express.Router();

route.use('/api', userRouter);
route.use('/api', Kataroute);

module.exports = route;
