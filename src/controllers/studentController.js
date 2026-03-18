const academicService = require('../services/academicService');

async function getProfile(req, res, next) {
  try {
    const student = req.user;
    const gpa = await academicService.calculateGPA(student.id);
    
    res.json({
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        national_id: student.national_id,
        level: student.level,
        gpa: gpa,
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
};
