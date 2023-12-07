const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * */
    await queryInterface.bulkInsert('Kata', [{
      indonesia: 'test',
      sasak: 'test',
      audioUrl: 'test',
      contohPenggunaanIndo: 'test',
      contohPenggunaanSasak: 'test',
      userId: uuidv4(),
      // status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
