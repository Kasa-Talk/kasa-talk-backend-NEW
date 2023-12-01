// eslint-disable-next-line lines-around-directive

const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
      // User.hasMany(models.Kata, {
      //   foreignKey: 'userId',
      //   onDelete: 'RESTRICT',
      //   onUpdate: 'RESTRICT',
      // });
    }
  }
  User.init({
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
    avatarUrl: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
