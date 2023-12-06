const express = require('express');
const cors = require('cors');
require('./winston');
const route = require('../routes/index');

const appMiddleware = express();

appMiddleware.use(
  cors({
    origin: '*',
    credentials: true,
    preflightContinue: false,
    methods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
  }),
);

appMiddleware.options('*', cors());
appMiddleware.use(express.json());
appMiddleware.use(route);

module.exports = appMiddleware;
