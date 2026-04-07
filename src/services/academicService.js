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

// Added placeholder since courseController.js expects this function.
// Replace with your actual implementation if you already have one.
async function getAvailableCourses(studentId, studentLevel) {
  return [];
}

module.exports = {
  dropStudentCourse,
  getAvailableCourses
};
