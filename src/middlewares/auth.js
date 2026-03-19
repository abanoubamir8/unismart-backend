const AppError = require('../exceptions/AppError');

const authMiddleware = (req, res, next) => {
  const sessionId = req.headers['session-id'];

  if (!sessionId) {
    return next(new AppError('Unauthorized: No session-id provided', 401));
  }

  req.sessionId = sessionId;
  
  next();
};

module.exports = authMiddleware;
