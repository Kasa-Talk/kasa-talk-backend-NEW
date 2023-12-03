const express = require('express');
const { setUser, setActivateUser } = require('../controllers/user.controller');

const userRouter = express.Router();

userRouter.post('/register', setUser);
userRouter.get('/users/activate/:id', setActivateUser);

module.exports = userRouter;
