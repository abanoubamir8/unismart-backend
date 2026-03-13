const authService = require('../services/authService');

async function login(req, res) {
  try {
    const { nationalId, password } = req.body;
    if (!nationalId || !password) {
      return res.status(400).json({ error: 'Missing nationalId or password' });
    }

    const result = await authService.login(nationalId, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

module.exports = {
  login,
};
