const { User, Session } = require('../models');
const AppError = require('../exceptions/AppError');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Not authorized, no token', 401);
    }

    const token = authHeader.split(' ')[1];
    const session = await Session.findOne({ where: { session_id: token } });

    if (!session) {
      throw new AppError('Not authorized, invalid token', 401);
    }

    const user = await User.findByPk(session.user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: You do not have permission', 403));
    }
    next();
  };
};

module.exports = { protect, authorize };
