const route = require('express').Router();
const { 
  getAllKata, 
  getKataById, 
  searchKataByIndonesia, 
  searchKataBySasak,
  addKata
} = require('../controllers/kata.controller');

route.get('/', getAllKata);
route.get('/:id', getKataById);
route.get('/t/indonesia', searchKataByIndonesia);
route.get('/t/sasak', searchKataBySasak);
route.post('/', addKata)

module.exports = route;