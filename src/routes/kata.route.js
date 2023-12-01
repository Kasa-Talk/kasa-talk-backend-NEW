const kataRouter = require('express').Router();
const {
  getAllKata,
  getKataById,
  searchKataByIndonesia,
  searchKataBySasak,
  addKata,
} = require('../controllers/kata.controller');

kataRouter.get('/', getAllKata);
kataRouter.get('/:id', getKataById);
kataRouter.get('/t/indonesia', searchKataByIndonesia);
kataRouter.get('/t/sasak', searchKataBySasak);
kataRouter.post('/', addKata);

module.exports = kataRouter;
