const { DataTypes } = require('sequelize');
const sequelize = require('../lib/db/sequelize');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academic_year: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  timestamps: false
});

module.exports = Enrollment;
