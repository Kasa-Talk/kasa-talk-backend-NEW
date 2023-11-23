'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Kata.init({
    indonesia: DataTypes.STRING,
    sasak: DataTypes.STRING,
    audioUrl: DataTypes.STRING,
    contohPenggunaan: DataTypes.STRING,
    status: DataTypes.ENUM
  }, {
    sequelize,
    modelName: 'Kata',
  });
  return Kata;
};