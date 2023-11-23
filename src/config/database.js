require('dotenv').config();

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
 process.env.DB_NAME,
 process.env.DB_USERNAME,
 process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

// testing connection
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

module.exports = sequelize;
