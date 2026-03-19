const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AppError = require('../exceptions/AppError');

const users = [
  {
    id: 1,
    national_id: '12345678901234',
    passwordHash: bcrypt.hashSync('password123', 10),
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: 2,
    national_id: '98765432109876',
    passwordHash: bcrypt.hashSync('student123', 10),
    name: 'Student User',
    role: 'student'
  }
];

const mockSessions = new Map();

const login = async (national_id, password) => {
  const user = users.find(u => u.national_id === national_id);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const session_id = crypto.randomBytes(16).toString('hex');
  
  mockSessions.set(session_id, user.id);

  return {
    session_id,
    user: {
      id: user.id,
      name: user.name,
      role: user.role
    }
  };
};

module.exports = {
  login,
  mockSessions
};
