const route = require('express').Router();
const { getAllKata } = require('../controllers/kata.controller');

route.get('/list', getAllKata);

module.exports = route;
