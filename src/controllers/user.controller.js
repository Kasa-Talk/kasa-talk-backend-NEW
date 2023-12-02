const moment = require('moment');
const { dataValid } = require('../validation/dataValidation');
const { sendMail } = require('../utils/sendMail');
const { User } = require('../models');
const { unsubscribe } = require('../middleware');

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

    const userExists = await User.findAll({
      attributes: ['name', 'email', 'isActive', 'expireTime'],
      where: {
        email: user.data.email,
      },
    });

    console.log(userExists);

    if (userExists) {
      return res.status(400).json({
        errors: ['Email already activated'],
        message: 'Register Field',
        data: null,
      });
      // eslint-disable-next-line no-else-return
    } else if (
      userExists > 0
      && !userExists[0].isActive
      && Date.parse(userExists[0].expireTime) > new Date()
    ) {
      return res.status(400).json({
        errors: ['Email already registered, please check your email'],
        message: 'Register Field',
        data: null,
      });
    } else {
      User.destroy({
        where: {
          email: user.data.email,
        },
      });
    }

    console.log(user.data);

    const newUser = await User.create({
      ...user.data,
    });

    if (!newUser) {
      return res.status(500).json({
        errors: ['User not created in the database'],
        message: 'Register Failed',
        data: null,
      });
    }

    // const result = await sendMail(newUser.email, newUser.id);

    // if (!result) {
    //   return res.status(500).json({
    //     errors: ['Send email failed'],
    //     message: 'Register Failed',
    //     data: null,
    //   });
    // }
    res.status(201).json({
      errors: null,
      message: 'User created, please check your email',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        expireTime: newUser.expireTime,
      },
    });
  } catch (error) {
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

// const { User } = require('../models');

// // eslint-disable-next-line consistent-return
// const setUser = async (req, res, next) => {
//   const { name, email, password } = req.body;
//   try {
//     const newUser = await User.create({
//       name,
//       email,
//       password,
//     });

//     if (!newUser) {
//       return res.status(500).json({
//         errors: ['User not created in the database'],
//         message: 'Register Failed',
//         data: null,
//       });
//     }

//     console.log(newUser);

//     res.status(201).json({
//       errors: null,
//       message: 'User created',
//       data: {
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email,
//       },
//     });
//   } catch (error) {
//     console.error('Error creating user:', error);
//     return res.status(500).json({
//       errors: ['User creation failed'],
//       message: 'Register Failed',
//       data: null,
//     });
//   }
// };

// module.exports = {
//   setUser,
// };
