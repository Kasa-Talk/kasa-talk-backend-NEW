const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { encrypt } = require('../utils/bcrypt');
require('dotenv').config();

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
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4(),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.UUID,
        defaultValue: uuidv4(),
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
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
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue('password', encrypt(value));
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      avatarUrl: {
        type: DataTypes.STRING,
        defaultValue: process.env.USER_PROFILE_PICTURE,
      },
      expireTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
      timezone: '+08:00',
    },
  );
  return User;
};
