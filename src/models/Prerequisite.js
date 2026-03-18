const { DataTypes } = require('sequelize');
const sequelize = require('../lib/db/sequelize');

const Prerequisite = sequelize.define('Prerequisite', {}, {
  timestamps: false
});

module.exports = Prerequisite;
