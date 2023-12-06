const express = require('express');
const { upload } = require('../middleware/multer');
const { setWord } = require('../controllers/word.controller');
const { autenticate } = require('../controllers/auth-Error.controller');

const wordRouter = express.Router();

wordRouter.post('/kata', autenticate, upload.single('audio'), setWord);

module.exports = wordRouter;
