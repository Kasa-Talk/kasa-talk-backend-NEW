const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { encript } = require('../utils/bcrypt');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: uuidv4(),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
        set(value) {
          this.setDataValue('email', value.toLowerCase());
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue('password', encript(value));
        },
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      avatarUrl: {
        type: Sequelize.STRING,
        defaultValue: process.env.USER_PROFILE_PICTURE,
      },
      expireTime: {
        type: Sequelize.DATE,
        defaultValue: moment().add(1, 'hours').toDate(),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  },
};
