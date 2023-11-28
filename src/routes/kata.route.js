const route = require('express').Router();
const { 
  getAllKata, 
  getKataById, 
  searchKataByIndonesia, 
  searchKataBySasak 
} = require('../controllers/kata.controller');

route.get('/list', getAllKata);
route.get('/:id', getKataById);
route.get('/t/indonesia', searchKataByIndonesia);
route.get('/t/sasak', searchKataBySasak);

module.exports = route;
