const Sequelize = require('sequelize');
require('dotenv').config();

const DATABASE_URL =xxx;
// PLANET SCALE

const sequelize = new Sequelize(DATABASE_URL, {
  logging:
    process.env.NODE_ENV === 'development'
      ? (...msg) => console.log(msg)
      : false,
  logging: false,
  dialectOptions: {
    // requestTimeout: 3000000,
    // encrypt: true,
    // useUTC: false, // for reading from database
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    dateStrings: true,
    typeCast(field, next) {
      // for reading from database
      if (field.type === 'DATETIME') {
        return field.string();
      }
      return next();
    },
  },
  //timezone: 'Asia/Jakarta',
  insecureAuth: true,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('DB connection established successfully');
  })
  .catch((err) => {
    console.log('Unable to connect to DB', err);
  });

module.exports = sequelize;
