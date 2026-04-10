const { Registration } = require('../models');

async function dropStudentCourse(university_id, course_code) {
  try {
    const deletedCount = await Registration.destroy({
      where: {
        university_id,
        course_code
      }
    });

    return deletedCount;
  } catch (error) {
    console.error("Error in dropStudentCourse:", error);
    throw error;
  }
}

async function getAvailableCourses(studentId, studentLevel) {
  return [];
}

module.exports = {
  dropStudentCourse,
  getAvailableCourses
};
