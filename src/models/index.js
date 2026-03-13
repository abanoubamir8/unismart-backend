const sequelize = require('../lib/db/sequelize');
const User = require('./User');
const Session = require('./Session');

User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Session,
};
