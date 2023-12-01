const moment = require('moment');

// eslint-disable-next-line no-unused-expressions
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
      },
      avatarUrl: {
        type: Sequelize.STRING,
      },
      expireTime: {
        type: Sequelize.DATE,
        set(value) {
          if (value !== null) {
            this.setDataValue('expireTime', moment(value).add(1, 'hours'));
          } else {
            this.setDataValue('expireTime', null);
          }
        },
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
  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  },
};
