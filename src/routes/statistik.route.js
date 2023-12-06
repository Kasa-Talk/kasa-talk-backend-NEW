const express = require('express');
const { getStatistik } = require('../controllers/statistik.controller');
const { autenticate } = require('../controllers/auth-Error.controller');

const statistikRouter = express.Router();

statistikRouter.get('/statistik', autenticate, getStatistik);

module.exports = { statistikRouter };
