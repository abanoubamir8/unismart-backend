const { User } = require('../models');

async function getStudents(req, res, next) {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'level', 'gpa']
    });
    
    res.json({ data: students });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudents,
};
