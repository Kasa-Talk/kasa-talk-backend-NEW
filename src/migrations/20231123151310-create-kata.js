/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Kata', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
        type: Sequelize.STRING,
        allowNull: false,
      },
      contohPenggunaan: {
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
        allowNull: true,
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
