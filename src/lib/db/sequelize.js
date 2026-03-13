const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('unismart', 'root', '', {
  host: 'localhost',
  dialect: 'mariadb',
  logging: false,
});

module.exports = sequelize;
