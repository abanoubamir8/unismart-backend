const authService = require('../services/authService');
const AppError = require('../exceptions/AppError');

async function login(req, res, next) {
  try {
    const { national_id, password } = req.body;
    if (!national_id || !password) {
      throw new AppError('Missing national_id or password', 400);
    }

    const result = await authService.login(national_id, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
};
