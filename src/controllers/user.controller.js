const moment = require('moment');
const { Op } = require('sequelize');
const { v4: uuid } = require('uuid');
const { promisify } = require('util');
const { Entropy, charset32 } = require('entropy-string');
const { dataValid } = require('../validation/dataValidation');
const { sendMail, sendPassword, sendMailMessage } = require('../utils/sendMail');
const { User, Kata, sequelize } = require('../models');
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
const { isExists } = require('../validation/sanitization');
const { bucket } = require('../middleware/multer');

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
        expireTime: moment().utcOffset('+08:00').add(1, 'hours').toDate(),
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

    res.status(201).json({
      errors: null,
      message: 'User created, please check your email to activate your account',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        expireTime: moment(newUser.expireTime).format('YYYY-MM-DD HH:mm:ss'),
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
          [Op.gte]: moment().utcOffset('+08:00'),
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

// eslint-disable-next-line consistent-return
const updateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const tokenInfo = getUserIdFromAccessToken(token);
    const { id } = tokenInfo;

    const valid = {};
    if (isExists(req.body.name)) {
      valid.name = 'required';
    }
    if (isExists(req.body.email)) {
      valid.email = 'required,isEmail';
    }
    if (isExists(req.body.password)) {
      valid.password = 'required,isStrongPassword';
      valid.confirmPassword = 'required';
    }
    const user = await dataValid(valid, req.body);
    if (
      isExists(user.data.password)
      && user.data.password !== user.data.confirmPassword
    ) {
      user.message.push('Password not match');
    }
    if (user.message.length > 0) {
      return res.status(400).json({
        errors: user.message,
        message: 'Update Failed',
        data: null,
      });
    }

    const updateData = {
      ...user.data,
    };

    if (isExists(req.body.avatarUrl)) {
      updateData.avatarUrl = req.body.avatarUrl;
    }

    const result = await User.update(updateData, {
      where: {
        id,
      },
    });

    if (result[0] === 0) {
      return res.status(404).json({
        errors: ['User not found'],
        message: 'Update Failed',
        data: null,
      });
    }
    return res.status(200).json({
      errors: [],
      message: 'User updated successfully',
      data: null,
    });
  } catch (error) {
    next(
      new Error(`controllers/userController.js:updateUser - ${error.message}`),
    );
  }
};

// eslint-disable-next-line consistent-return
const forgotPassword = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const valid = {
      email: 'required,isEmail',
    };
    const userData = await dataValid(valid, req.body);
    if (userData.message.length > 0) {
      return res.status(400).json({
        errors: userData.message,
        message: 'Forgot Password Failed',
        data: null,
      });
    }
    const user = await User.findOne({
      where: {
        email: userData.data.email,
      },
    });
    if (!user) {
      return res.status(404).json({
        errors: ['User not found'],
        message: 'Forgot Password Failed',
        data: null,
      });
    }
    // get random password
    const random = new Entropy({ bits: 60, charset: charset32 });
    const stringPwd = random.string();
    await User.update(
      {
        password: stringPwd,
      },
      {
        where: {
          id: user.id,
        },
        transaction: t,
      },
    );

    const result = await sendPassword(user.email, stringPwd);

    if (!result) {
      await t.rollback();
      return res.status(400).json({
        errors: ['Email not sent'],
        message: 'Forgot Password Failed',
        data: null,
      });
    }
    await t.commit();
    return res.status(200).json({
      errors: [],
      message: 'Forgot Password success, please check your email',
      data: null,
    });
  } catch (error) {
    await t.rollback();
    next(
      new Error(
        `controllers/userController.js:forgotPassword - ${error.message}`,
      ),
    );
  }
};

// eslint-disable-next-line consistent-return
const updateAvatarUser = async (req, res, next) => {
  const transaction = await sequelize.transaction();
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
        message: 'Update Avatar Failed',
        data: null,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        errors: ['File not found'],
        message: 'Update Avatar Failed',
        data: null,
      });
    }

    const allowedImageFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedImageFormats.includes(req.file.mimetype)) {
      return res.status(400).json({
        errors: ['Invalid file format. Only JPEG, JPG, and PNG images are allowed.'],
        message: 'Update Avatar Failed',
        data: null,
      });
    }

    const folderName = 'avatar';
    const fileName = `${uuid()}-${req.file.originalname}`;
    const filePath = `${folderName}/${fileName}`;

    const metadata = {
      metadata: {
        firebaseStorageDownloadTokens: uuid(),
      },
      contentType: req.file.mimetype,
      cacheControl: 'public, max-age=31536000',
    };

    const blob = bucket.file(filePath);
    const blobStream = blob.createWriteStream({
      metadata,
      gzip: true,
    });

    blobStream.on('error', (error) => res.status(500).json({
      errors: [error.message],
      message: 'Update Avatar Failed',
      data: null,
    }));

    let url;
    blobStream.on('finish', async () => {
      url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;
    });

    const blobStreamEnd = promisify(blobStream.end).bind(blobStream);

    await blobStreamEnd(req.file.buffer);

    const result = await User.update(
      {
        avatarUrl: url,
      },
      {
        where: {
          id,
        },
        transaction,
      },
    );

    if (!result) {
      await transaction.rollback();
      return res.status(400).json({
        errors: ['User not found'],
        message: 'Update Avatar Failed',
        data: null,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      errors: [],
      message: 'Update Avatar Success',
      data: url,
    });
  } catch (error) {
    await transaction.rollback();
    next(
      new Error(
        `controllers/userController.js:updateAvatarUser - ${error.message}`,
      ),
    );
  }
};

// eslint-disable-next-line consistent-return
const removeUserAccount = async (req, res, next) => {
  const transaction = await sequelize.transaction();
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
        message: 'Remove User Account Failed',
        data: null,
      });
    }

    const cekUserKataActive = await Kata.findOne({
      where: {
        userId: id,
        status: 'active',
      },
    });

    if (cekUserKataActive) {
      const adminId = await User.findOne({
        where: {
          email: process.env.ADMIN_EMAIL,
        },
      });

      const resultKata = await Kata.update(
        {
          userId: adminId.id,
        },
        {
          where: {
            userId: id,
          },
          transaction,
        },
      );

      if (!resultKata) {
        await transaction.rollback();
        return res.status(400).json({
          errors: ['Kata not update'],
          message: 'Remove User Account Failed',
          data: null,
        });
      }
    }

    const cekUserKataPending = await Kata.findOne({
      where: {
        userId: id,
        status: 'pending',
      },
    });

    if (cekUserKataPending) {
      const resultKataPending = await Kata.destroy({
        where: {
          userId: id,
          status: 'pending',
        },
        transaction,
      });

      console.log(resultKataPending);

      if (!resultKataPending) {
        await transaction.rollback();
        return res.status(400).json({
          errors: ['Kata not destroyed'],
          message: 'Remove User Account Failed',
          data: null,
        });
      }
    }

    const result = await User.destroy({
      where: {
        id,
      },
    });

    if (!result) {
      await transaction.rollback();
      return res.status(400).json({
        errors: ['User not found'],
        message: 'Remove User Account Failed',
        data: null,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      errors: [],
      message: 'Remove User Account Success',
      data: null,
    });
  } catch (error) {
    await transaction.rollback();
    next(
      new Error(
        `controllers/userController.js:removeUserAccount - ${error.message}`,
      ),
    );
  }
};

// eslint-disable-next-line consistent-return
const sendMessage = async (req, res, next) => {
  const valid = {
    email: 'required, isEmail',
    name: 'required',
    subject: 'required',
    message: 'required',
  };
  try {
    const dataSender = await dataValid(valid, req.body);

    if (dataSender.message.length > 0) {
      return res.status(400).json({
        errors: dataSender.message,
        message: 'Failed Send Message Email',
        data: null,
      });
    }

    const {
      email, name, subject, message,
    } = dataSender.data;

    const sendMailVariable = await sendMailMessage(email, name, subject, message);

    if (!sendMailVariable) {
      return res.status(400).json({
        errors: ['Failed Send Message Email'],
        message: 'Failed Send Message Email',
        data: null,
      });
    }

    return res.status(200).json({
      errors: [],
      message: 'Success Send Message Email',
      data: null,
    });
  } catch (error) {
    next(
      new Error(
        `controllers/userController.js:sendMessage - ${error.message}`,
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
  updateUser,
  forgotPassword,
  updateAvatarUser,
  removeUserAccount,
  sendMessage,
};
