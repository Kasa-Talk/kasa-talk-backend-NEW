const express = require('express');
const { setUser } = require('../controllers/user.controller');

const userRouter = express.Router();

userRouter.post('/register', setUser);

module.exports = userRouter;
