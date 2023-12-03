const moment = require('moment');
const { Op } = require('sequelize');
const { dataValid } = require('../validation/dataValidation');
const { sendMail } = require('../utils/sendMail');
const { User, sequelize } = require('../models');
const {
  userNotFoundHtml,
  userActivatedHtml,
} = require('../utils/responActivation');
const {
  getUserIdFromAccessToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseJWT,
} = require('../utils/jwt');
const { compare } = require('../utils/bcrypt');

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
      expireTimeMoment = moment(
        userExists[0].expireTime,
        'YYYY-MM-DD HH:mm:ss',
      ).utcOffset('+08:00');
      currentDateTime = moment().utcOffset('+08:00');
    }

    if (
      userExists.length > 0
      && !userExists[0].isActive
      && expireTimeMoment.isAfter(currentDateTime)
    ) {
      return res.status(400).json({
        errors: [
          'Account already registered, please check your email to activate your account',
        ],
        message: 'Register Field',
        data: null,
      });
    }

    if (
      userExists.length > 0
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

    const newUser = await User.create(
      {
        ...user.data,
      },
      {
        transaction,
      },
    );

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

    const formattedExpireTime = moment(newUser.expireTime).format(
      'YYYY-MM-DD HH:mm:ss',
    );

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

// eslint-disable-next-line consistent-return
const setActivateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({
      where: {
        id: userId,
        isActive: false,
        expireTime: {
          [Op.gte]: moment().utcOffset('+08:00').format('YYYY-MM-DD HH:mm:ss'),
        },
      },
    });
    if (!user) {
      return res.status(404).send(userNotFoundHtml);
    }
    const userName = user.name;
    const userEmail = user.email;

    user.isActive = true;
    user.expireTime = null;
    await user.save();

    const userActivatedResponse = userActivatedHtml(userName, userEmail);

    return res.status(200).send(userActivatedResponse);
  } catch (error) {
    next(
      new Error(
        `controllers/userController.js:setActivateUser - ${error.message}`,
      ),
    );
  }
};

// eslint-disable-next-line consistent-return
const getAllUser = async (req, res, next) => {
  try {
    const users = await User.findAll();

    if (!users) {
      return res.status(404).json({
        errors: ['User not found'],
        message: 'User not found',
        data: null,
      });
    }

    const allUser = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.status(200).json({
      errors: [],
      message: 'User retrieved successfully',
      data: allUser,
    });
  } catch (error) {
    next(new Error(`controllers/userController.js:getUser - ${error.message}`));
  }
};

// eslint-disable-next-line consistent-return
const getUserById = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const tokenInfo = getUserIdFromAccessToken(token);

    const { id } = tokenInfo;

    const user = await User.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      return res.status(404).json({
        errors: ['User not found'],
        message: 'Get User By Id Failed',
        data: null,
      });
    }
    return res.status(200).json({
      errors: [],
      message: 'Get user by id successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(
      new Error(`controllers/userController.js:getUserById - ${error.message}`),
    );
  }
};

// eslint-disable-next-line consistent-return
const setLogin = async (req, res, next) => {
  try {
    const valid = {
      email: 'required,isEmail',
      password: 'required',
    };
    const user = await dataValid(valid, req.body);
    const { data } = user;
    if (user.message.length > 0) {
      return res.status(400).json({
        errors: user.message,
        message: 'Login Failed',
        data: null,
      });
    }

    const userExists = await User.findOne({
      where: {
        email: data.email,
        isActive: true,
      },
    });

    if (!userExists) {
      return res.status(400).json({
        errors: ['User not found'],
        message: 'Login Failed',
        data,
      });
    }
    if (compare(data.password, userExists.password)) {
      const usr = {
        id: userExists.id,
        name: userExists.name,
        email: userExists.email,
        role: 'user', // default role user
      };

      // khusus admin login
      const adminEmail = process.env.ADMIN_EMAIL;
      if (req.url.includes('/admin') && usr.email === adminEmail) {
        usr.role = 'admin';
      }

      const token = generateAccessToken(usr);
      const refreshToken = generateRefreshToken(usr);

      return res.status(200).json({
        errors: [],
        message: 'Login successfully',
        data: usr,
        accessToken: token,
        refreshToken,
      });
    }

    return res.status(400).json({
      errors: ['Wrong password'],
      message: 'Login Failed',
      data,
    });
  } catch (error) {
    next(
      new Error(`controllers/userController.js:setLogin - ${error.message}`),
    );
  }
};

// eslint-disable-next-line consistent-return
const setRefreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        errors: ['Refresh token not found'],
        message: 'Refresh Failed',
        data: null,
      });
    }
    const verify = verifyRefreshToken(token);
    if (!verify) {
      return res.status(401).json({
        errors: ['Invalid refresh token'],
        message: 'Refresh Failed',
        data: null,
      });
    }
    const data = parseJWT(token);
    const user = await User.findOne({
      where: {
        email: data.email,
        isActive: true,
      },
    });
    if (!user) {
      return res.status(404).json({
        errors: ['User not found'],
        message: 'Refresh Failed',
        data: null,
      });
    }

    const usr = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'user', // default role user
    };

    const adminEmail = process.env.ADMIN_EMAIL;
    if (req.url.includes('/admin') && usr.email === adminEmail) {
      usr.role = 'admin';
    }

    const tokenNew = generateAccessToken(usr);
    const refreshToken = generateRefreshToken(usr);

    return res.status(200).json({
      errors: [],
      message: 'Refresh successfully',
      data: usr,
      accessToken: tokenNew,
      refreshToken,
    });
  } catch (error) {
    next(
      new Error(
        `controllers/userController.js:setRefreshToken - ${error.message}`,
      ),
    );
  }
};

module.exports = {
  setUser,
  setActivateUser,
  getAllUser,
  getUserById,
  setLogin,
  setRefreshToken,
};
