const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, Session } = require('../models');

async function login(nationalId, password) {
  const user = await User.findOne({ where: { nationalId } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const sessionId = crypto.randomBytes(32).toString('hex');
  const session = await Session.create({
    sessionId,
    userId: user.id,
  });

  return { user, sessionId: session.sessionId };
}

module.exports = {
  login,
};
