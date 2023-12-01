require('dotenv').config();

module.exports = {
  // development: {
  //   username: process.env.DB_USERNAME,
  //   password: process.env.DB_PASSWORD,
  //   database: process.env.DB_NAME,
  //   host: process.env.DB_HOST,
  //   dialect: process.env.DB_DIALECT,
  //   dialectOptions: {
  //     ssl: {
  //       require: true,
  //       rejectUnauthorized: false,
  //     },
  //     dateStrings: true,
  //   },
  // },
  development: {
    username: 'root',
    password: '',
    database: 'kasa_talk_test',
    host: '127.0.0.1',
    dialect: 'mysql',
    port: '3306',
    dialectOptions: {
      dateStrings: true,
    },
  },
  test: {
    username: process.env.DB_USERNAME_TEST,
    password: process.env.DB_PASSWORD_TEST,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST_TEST,
    dialect: process.env.DB_DIALECT_TEST,
    port: process.env.DB_PORT_TEST,
    dialectOptions: {
      dateStrings: true,
    },
  },
  production: {
    username: process.env.DB_USERNAME_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
    dialect: process.env.DB_DIALECT_PROD,
    port: process.env.DB_PORT_PROD,
    dialectOptions: {
      dateStrings: true,
    },
  },
};
