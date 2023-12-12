const express = require('express');
const {
  setWord,
  getAllWord,
  deleteWord,
  translateWord,
  approveWordAdmin, declineWordAdmin, getAllUserWord, getTopContributor,
} = require('../controllers/word.controller');
const { autenticate } = require('../controllers/auth-Error.controller');

const wordRouter = express.Router();

wordRouter.post('/kata', autenticate, setWord);

wordRouter.get('/kata/all', autenticate, getAllWord); // admin

wordRouter.patch('/kata/confirm/:id', autenticate, approveWordAdmin); // admin

wordRouter.delete('/kata/confirm/:id', autenticate, declineWordAdmin); // admin

wordRouter.get('/kata', autenticate, getAllUserWord);

wordRouter.delete('/kata/:id', autenticate, deleteWord);

wordRouter.get('/kata/translate', translateWord);

wordRouter.get('/kata/top-contributor', getTopContributor);

module.exports = wordRouter;
