const express = require('express');
const {
  setUser, setActivateUser, getAllUser, setLogin,
} = require('../controllers/user.controller');

const userRouter = express.Router();

userRouter.post('/register', setUser);

userRouter.get('/users/activate/:id', setActivateUser);

userRouter.get('/users', getAllUser); // admin only

userRouter.post('/login', setLogin);

userRouter.post('/admin/login', setLogin); // admin only

module.exports = userRouter;
