const moment = require('moment');
const { dataValid } = require('../validation/dataValidation');
const { sendMail } = require('../utils/sendMail');
const { User } = require('../models');

// eslint-disable-next-line consistent-return
const setUser = async (req, res, next) => {
  const valid = {
    name: 'required',
    email: 'required,isEmail',
    password: 'required,isStrongPassword',
    confirmPassword: 'required',
  };

  try {
    const user = await dataValid(valid, req.body);

    // Cek password
    if (user.data.password !== user.data.confirmPassword) {
      user.message.push('Password does not match');
    }

    if (user.message.length > 0) {
      return res.status(400).json({
        errors: user.message,
        message: 'Register Failed',
        data: null,
      });
    }

    console.log(user);

    const userExists = await User.findAll({
      where: {
        email: user.data.email,
      },
    });

    if (userExists.length > 0 && userExists[0].isActive) {
      return res.status(400).json({
        errors: ['Email already activated'],
        message: 'Register Field',
        data: null,
      });
    // eslint-disable-next-line no-else-return
    } else if (
      userExists.length > 0
      && !userExists[0].isActive
      && Date.parse(userExists[0].expireTime) > new Date()
    ) {
      return res.status(400).json({
        errors: ['Email already registered, please check your email'],
        message: 'Register Field',
        data: null,
      });
    } else {
      User.destroy(
        {
          where: {
            email: user.data.email,
          },
        },
      );
    }

    const newUser = await User.create({
      ...user.data,
      expireTime: moment().add(1, 'hours').tz('Asia/Makassar').toDate(),
    });

    if (!newUser) {
      return res.status(500).json({
        errors: ['User not created in the database'],
        message: 'Register Failed',
        data: null,
      });
    }

    console.log(`id user${newUser.userId}`);

    const result = await sendMail(newUser.email, newUser.userId);

    if (!result) {
      return res.status(500).json({
        errors: ['Send email failed'],
        message: 'Register Failed',
        data: null,
      });
    }
    res.status(201).json({
      errors: null,
      message: 'User created, please check your email',
      data: {
        id: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        expireTime: moment(newUser.expireTime).format(),
      },
    });
  } catch (error) {
    next(
      new Error(`controllers/user.controller.js:setUser - ${error.message}`),
    );
  }
};

module.exports = {
  setUser,
};
