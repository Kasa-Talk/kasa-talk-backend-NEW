'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kata', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      indonesia: {
        type: Sequelize.STRING,
      },
      sasak: {
        type: Sequelize.STRING,
      },
      audioUrl: {
        type: Sequelize.STRING,
      },
      contohPenggunaan: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['active', 'inactive', 'pending'],
        defaultValue: 'pending',
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
    await queryInterface.dropTable('Kata');
  },
};
