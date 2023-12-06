const express = require('express');
const { upload } = require('../middleware/multer');
const {
  setWord, getAllWord, deleteWord, translateWord,
} = require('../controllers/word.controller');
const { autenticate } = require('../controllers/auth-Error.controller');

const wordRouter = express.Router();

wordRouter.get('/kata/all', autenticate, getAllWord);
wordRouter.post('/kata', autenticate, upload.single('audio'), setWord);
wordRouter.delete('/kata/:id', autenticate, deleteWord);
wordRouter.get('/kata/translate', translateWord);

module.exports = wordRouter;
