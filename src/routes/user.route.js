const express = require('express');
const { setUser, setActivateUser, getAllUser } = require('../controllers/user.controller');

const userRouter = express.Router();

userRouter.post('/register', setUser);
userRouter.get('/users/activate/:id', setActivateUser);
userRouter.get('/users', getAllUser); // admin only

module.exports = userRouter;
