const registrationService = require('../services/registrationService');
const AppError = require('../exceptions/AppError');

async function enroll(req, res, next) {
  try {
    const { courseIds, semester, academic_year } = req.body;
    if (!semester || !academic_year) {
      throw new AppError('Missing semester or academic_year', 400);
    }
    const enrollments = await registrationService.enroll(req.user, courseIds, semester, academic_year);
    res.status(201).json({
      message: 'Enrollment successful',
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  enroll,
};
