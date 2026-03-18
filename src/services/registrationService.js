const { Course, Prerequisite, Enrollment, Grade } = require('../models');
const AppError = require('../exceptions/AppError');
const { Op } = require('sequelize');

async function enroll(student, courseIds, semester, academic_year) {
  if (!courseIds || courseIds.length === 0) {
    throw new AppError('No courses provided for enrollment', 400);
  }

  const courses = await Course.findAll({
    where: { id: courseIds },
    include: [{ model: Course, as: 'Prerequisites' }]
  });

  if (courses.length !== courseIds.length) {
    throw new AppError('One or more courses not found', 404);
  }

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const maxCredits = student.gpa >= 3.0 ? 21 : 18;

  if (totalCredits < 12) {
    throw new AppError(`Minimum credit hours requirement is 12. You attempted ${totalCredits}`, 400);
  }
  if (totalCredits > maxCredits) {
    throw new AppError(`Maximum credit hours exceeded. Allowed: ${maxCredits}, Attempted: ${totalCredits}`, 400);
  }

  const passedGrades = await Grade.findAll({
    where: {
      student_id: student.id,
      points: { [Op.gte]: 1.0 }
    }
  });
  const passedCourseIds = passedGrades.map(g => g.course_id);

  for (const course of courses) {
    if (course.Prerequisites && course.Prerequisites.length > 0) {
      for (const req of course.Prerequisites) {
        if (!passedCourseIds.includes(req.id)) {
          throw new AppError(`Missing prerequisite ${req.code} for course ${course.code}`, 400);
        }
      }
    }
  }

  const existingEnrollments = await Enrollment.findAll({
    where: {
      student_id: student.id,
      semester,
      academic_year,
      course_id: courseIds
    }
  });

  if (existingEnrollments.length > 0) {
    throw new AppError('Conflict: Already registered for one or more of these courses this semester', 400);
  }

  const enrollmentsToCreate = courseIds.map(course_id => ({
    student_id: student.id,
    course_id,
    semester,
    academic_year,
    status: 'pending'
  }));

  const created = await Enrollment.bulkCreate(enrollmentsToCreate);
  return created;
}

module.exports = {
  enroll,
};
