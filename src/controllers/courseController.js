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

async function dropCourse(req, res, next) {
  try {
    const { university_id, course_code } = req.body;

    if (!university_id || !course_code) {
      return res.status(400).json({ message: "university_id and course_code are required" });
    }

    const deletedRecord = await academicService.dropStudentCourse(university_id, course_code);

    if (deletedRecord) {
      return res.status(200).json({ message: "Course removed successfully" });
    } else {
      return res.status(404).json({ message: "Course record not found" });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAvailable,
  dropCourse,
};
