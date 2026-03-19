const AppError = require('../exceptions/AppError');

const mockStudents = [
  { student_id: 1, name: 'Alice', gpa: 3.5, level: 2, passed_courses: ['CS101', 'MATH101'], registered_courses: [] },
  { student_id: 2, name: 'Bob', gpa: 2.5, level: 1, passed_courses: [], registered_courses: [] }
];

const mockCourses = [
  { code: 'CS101', name: 'Intro to CS', credits: 3, level: 1, prerequisites: [] },
  { code: 'MATH101', name: 'Calculus I', credits: 3, level: 1, prerequisites: [] },
  { code: 'CS102', name: 'Data Structures', credits: 3, level: 1, prerequisites: ['CS101'] },
  { code: 'MATH102', name: 'Calculus II', credits: 3, level: 1, prerequisites: ['MATH101'] },
  { code: 'CS201', name: 'Algorithms', credits: 3, level: 2, prerequisites: ['CS102', 'MATH102'] },
  { code: 'CS202', name: 'Database Systems', credits: 3, level: 2, prerequisites: ['CS102'] },
  { code: 'CS203', name: 'Software Engineering', credits: 3, level: 2, prerequisites: ['CS102'] },
  { code: 'ENG101', name: 'English I', credits: 3, level: 1, prerequisites: [] }
];

const MIN_HOURS = 12;
const MAX_HOURS_STANDARD = 18;
const MAX_HOURS_HIGH_GPA = 21;
const HIGH_GPA_THRESHOLD = 3.0;

const validateCreditHours = (student, requestedCourses) => {
  const currentRegisteredCredits = student.registered_courses.reduce((sum, courseCode) => {
    const course = mockCourses.find(c => c.code === courseCode);
    return sum + (course ? course.credits : 0);
  }, 0);

  const requestedCredits = requestedCourses.reduce((sum, courseCode) => {
    const course = mockCourses.find(c => c.code === courseCode);
    return sum + (course ? course.credits : 0);
  }, 0);

  const totalCredits = currentRegisteredCredits + requestedCredits;

  let maxAllowed = MAX_HOURS_STANDARD;
  if (student.gpa >= HIGH_GPA_THRESHOLD) {
    maxAllowed = MAX_HOURS_HIGH_GPA;
  }

  if (totalCredits < MIN_HOURS) {
    return { valid: false, message: `Minimum required credit hours is ${MIN_HOURS}. Total would be ${totalCredits}.` };
  }

  if (totalCredits > maxAllowed) {
    return { valid: false, message: `Maximum allowed credit hours exceeded. Your max is ${maxAllowed}, total would be ${totalCredits}.` };
  }

  return { valid: true, message: 'Credit hours are valid' };
};

const checkPrerequisites = (student, courseCode) => {
  const course = mockCourses.find(c => c.code === courseCode);
  if (!course) {
    throw new AppError(`Course ${courseCode} not found`, 404);
  }

  for (const prereq of course.prerequisites) {
    if (!student.passed_courses.includes(prereq)) {
      return { valid: false, message: `Missing prerequisite ${prereq} for course ${courseCode}` };
    }
  }

  return { valid: true, message: 'Prerequisites met' };
};

const suggestCourses = (studentId) => {
  const student = mockStudents.find(s => s.student_id === studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  const suggested = mockCourses.filter(course => {
    if (student.passed_courses.includes(course.code)) return false;
    
    if (student.registered_courses.includes(course.code)) return false;

    if (course.level > student.level + 1) return false;

    const prereqCheck = checkPrerequisites(student, course.code);
    return prereqCheck.valid;
  });

  return suggested;
};

const registerForCourses = (studentId, requestedCourses) => {
  const student = mockStudents.find(s => s.student_id === studentId);
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  for (const courseCode of requestedCourses) {
    if (student.passed_courses.includes(courseCode)) {
      throw new AppError(`Already passed course: ${courseCode}`, 400);
    }
    if (student.registered_courses.includes(courseCode)) {
      throw new AppError(`Already registered for course: ${courseCode}`, 400);
    }
    
    const prereqCheck = checkPrerequisites(student, courseCode);
    if (!prereqCheck.valid) {
      throw new AppError(prereqCheck.message, 400);
    }
  }

  const creditCheck = validateCreditHours(student, requestedCourses);
  if (!creditCheck.valid) {
    throw new AppError(creditCheck.message, 400);
  }

  student.registered_courses.push(...requestedCourses);

  return student.registered_courses;
};

module.exports = {
  validateCreditHours,
  checkPrerequisites,
  suggestCourses,
  registerForCourses
};
