const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, Session } = require('../models');
const AppError = require('../exceptions/AppError');

async function login(national_id, password) {
  const user = await User.findOne({ where: { national_id } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const session_id = crypto.randomBytes(32).toString('hex');
  const session = await Session.create({
    session_id,
    user_id: user.id,
  });

  return { user, session_id: session.session_id };
}

module.exports = {
  login,
};
