const moment = require('moment');
const { dataValid } = require('../validation/dataValidation');
const { sendMail } = require('../utils/sendMail');
const { User, sequelize } = require('../models');

// eslint-disable-next-line consistent-return
const setUser = async (req, res, next) => {
  const valid = {
    name: 'required',
    email: 'required,isEmail',
    password: 'required,isStrongPassword',
    confirmPassword: 'required',
  };

  const transaction = await sequelize.transaction();

  try {
    const user = await dataValid(valid, req.body);

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

    const userExists = await User.findAll({
      where: {
        email: user.data.email,
      },
      transaction,
    });

    if (userExists.length > 0 && userExists[0].isActive) {
      return res.status(400).json({
        errors: ['Account already activated'],
        message: 'Register Field',
        data: null,
      });
    }

    let expireTimeMoment = null;
    let currentDateTime = null;

    if (userExists.length > 0) {
      expireTimeMoment = moment(userExists[0].expireTime, 'YYYY-MM-DD HH:mm:ss').utcOffset('+08:00');
      currentDateTime = moment().utcOffset('+08:00');
    }
    console.log(expireTimeMoment);
    console.log(currentDateTime);

    if (userExists.length > 0
      && !userExists[0].isActive
      && expireTimeMoment.isAfter(currentDateTime)) {
      return res.status(400).json({
        errors: ['Account already registered, please check your email to activate your account'],
        message: 'Register Field',
        data: null,
      });
    }

    if (userExists.length > 0
      && !userExists[0].isActive
      && !expireTimeMoment.isAfter(currentDateTime)
    ) {
      await User.destroy({
        where: {
          email: user.data.email,
        },
        transaction,
      });
    }

    const newUser = await User.create({
      ...user.data,
    }, {
      transaction,
    });

    if (!newUser) {
      await transaction.rollback();
      return res.status(500).json({
        errors: ['User not created in the database'],
        message: 'Register Failed',
        data: null,
      });
    }

    const result = await sendMail(newUser.email, newUser.id);

    if (!result) {
      await transaction.rollback();
      return res.status(500).json({
        errors: ['Send email failed'],
        message: 'Register Failed',
        data: null,
      });
    }

    await transaction.commit();

    const formattedExpireTime = moment(newUser.expireTime).format('YYYY-MM-DD HH:mm:ss');

    res.status(201).json({
      errors: null,
      message: 'User created, please check your email to activate your account',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        expireTime: formattedExpireTime,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(
      new Error(`controllers/user.controller.js:setUser - ${error.message}`),
    );
    return res.status(500).json({
      errors: ['User creation failed'],
      message: 'Register Failed',
      data: null,
    });
  }
};

module.exports = {
  setUser,
};
