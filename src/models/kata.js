// eslint-disable-next-line lines-around-directive

const {
  Model,
} = require('sequelize');

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
      // Kata.belongsTo(models.User, {
      //   foreignKey: 'userId',
      //   onDelete: 'RESTRICT',
      //   onUpdate: 'RESTRICT',
      // })
    }
  }
  Kata.init({
    indonesia: DataTypes.STRING,
    sasak: DataTypes.STRING,
    audioUrl: DataTypes.STRING,
    contohPenggunaan: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    sequelize,
    modelName: 'Kata',
  });
  return Kata;
};
