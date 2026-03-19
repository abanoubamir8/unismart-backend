const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { national_id, password } = req.body;
    
    if (!national_id || !password) {
      return res.status(400).json({ success: false, error: 'national_id and password are required' });
    }

    const data = await authService.login(national_id, password);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};
