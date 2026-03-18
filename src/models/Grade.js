const { DataTypes } = require('sequelize');
const sequelize = require('../lib/db/sequelize');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  points: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  timestamps: false
});

module.exports = Grade;
