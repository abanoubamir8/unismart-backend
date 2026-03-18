const academicService = require('../services/academicService');

async function getAvailable(req, res, next) {
  try {
    const student = req.user;
    const courses = await academicService.getAvailableCourses(student.id, student.level);
    res.json({ data: courses });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAvailable,
};
