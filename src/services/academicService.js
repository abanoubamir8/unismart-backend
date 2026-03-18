const { Course, Grade, User, Prerequisite } = require('../models');
const { Op } = require('sequelize');

async function calculateGPA(student_id) {
  const grades = await Grade.findAll({
    where: { student_id },
    include: [{ model: Course }]
  });

  if (grades.length === 0) return 0.0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const g of grades) {
    totalPoints += g.points * g.Course.credits;
    totalCredits += g.Course.credits;
  }

  const gpa = totalCredits === 0 ? 0.0 : totalPoints / totalCredits;
  
  await User.update({ gpa }, { where: { id: student_id } });
  
  return gpa;
}

async function getAvailableCourses(student_id, student_level) {
  const passedGrades = await Grade.findAll({
    where: {
      student_id,
      points: { [Op.gte]: 1.0 }
    }
  });
  
  const passedCourseIds = passedGrades.map(g => g.course_id);

  const allCourses = await Course.findAll({
    include: [{ model: Course, as: 'Prerequisites' }]
  });

  const availableCourses = allCourses.filter(course => {
    if (passedCourseIds.includes(course.id)) return false;

    if (course.Prerequisites && course.Prerequisites.length > 0) {
      for (const req of course.Prerequisites) {
        if (!passedCourseIds.includes(req.id)) {
          return false;
        }
      }
    }
    return true;
  });

  return availableCourses;
}

module.exports = {
  calculateGPA,
  getAvailableCourses
};
