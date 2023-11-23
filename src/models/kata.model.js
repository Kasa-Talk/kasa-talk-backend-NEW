const Sequelize = require('sequelize')
const db = require('../config/database')

const Kata = db.define("kata", {
  indonesia: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  sasak: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  audioUrl: {
    type: Sequelize.DataTypes.TEXT,
    allowNull: false,
  },
  contohPenggunaan: {
    type: Sequelize.DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: Sequelize.DataTypes.ENUM,
  },
}, {
  freezeTableName: true,
  timestamps: true,
})

module.exports = Kata;
