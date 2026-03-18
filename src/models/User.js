const { DataTypes } = require('sequelize');
const sequelize = require('../lib/db/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  national_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('student', 'staff', 'admin'),
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },
  gpa: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.0,
  },
}, {
  timestamps: false
});

module.exports = User;
