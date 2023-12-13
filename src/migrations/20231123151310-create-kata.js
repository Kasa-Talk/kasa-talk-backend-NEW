'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Kata', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      indonesia: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sasak: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      audioUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      contohPenggunaanIndo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contohPenggunaanSasak: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['active', 'inactive', 'pending'],
        defaultValue: 'pending',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
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
    await queryInterface.dropTable('Kata');
  },
};
