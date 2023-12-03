const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Kata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }
  }
  Kata.init(
    {
      indonesia: DataTypes.STRING,
      sasak: DataTypes.STRING,
      audioUrl: DataTypes.STRING,
      contohPenggunaan: DataTypes.STRING,
      userId: DataTypes.UUID,
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'pending'),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'Kata',
      timestamps: true,
      timezone: '+08:00',
    },
  );
  return Kata;
};
