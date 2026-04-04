const AppError = require('../exceptions/AppError');

const mockStudents = [
  {
    student_id: "2026001",
    password: "123",
    name: 'Abanoub Amir',
    gpa: 3.4,
    department: 'CS',
    passed_courses: ['UNV112', 'UNV113', 'BS111', 'CS111', 'CS112', 'CS212', 'IS111'],
    registered_courses: []
  }
];

const mockCourses = [
  // ==========================================
  // LEVEL 1: FRESHMAN (General Program)
  // ==========================================
  { code: 'UNV112', name: 'Societal Issues', credits: 2, level: 1, prerequisites: [] },
  { code: 'UNV113', name: 'English Language 1', credits: 2, level: 1, prerequisites: [] },
  { code: 'BS111', name: 'Math 1', credits: 3, level: 1, prerequisites: [] },
  { code: 'BS112', name: 'Discrete Mathematics', credits: 3, level: 1, prerequisites: [] },
  { code: 'BS116', name: 'Probability and Statistics 1', credits: 3, level: 1, prerequisites: [] },
  { code: 'CS111', name: 'Fundamentals of Computer Science', credits: 3, level: 1, prerequisites: [] },
  { code: 'IS111', name: 'Introduction to Information Systems', credits: 3, level: 1, prerequisites: [] },
  { code: 'UNV114', name: 'Communication Skills', credits: 2, level: 1, prerequisites: [] },
  { code: 'UNV111', name: 'Technical Report Writing', credits: 2, level: 1, prerequisites: [] },
  { code: 'BS113', name: 'Math 2', credits: 3, level: 1, prerequisites: ['BS111'] },
  { code: 'BS115', name: 'Electronics', credits: 3, level: 1, prerequisites: [] },
  { code: 'CS112', name: 'Structured Programming', credits: 3, level: 1, prerequisites: ['CS111'] },
  { code: 'IT111', name: 'Fundamentals of Information Technology', credits: 3, level: 1, prerequisites: [] },

  // ==========================================
  // LEVEL 2: SOPHOMORE (General Program)
  // ==========================================
  { code: 'BS117', name: 'Operations Research', credits: 3, level: 2, prerequisites: ['BS111'] },
  { code: 'BS114', name: 'Math 3', credits: 3, level: 2, prerequisites: ['BS113'] },
  { code: 'CS211', name: 'Object Oriented Programming', credits: 3, level: 2, prerequisites: ['CS112'] },
  { code: 'CS212', name: 'Data Structures', credits: 3, level: 2, prerequisites: ['CS112'] },
  { code: 'CS214', name: 'Operating Systems', credits: 3, level: 2, prerequisites: ['CS212'] },
  { code: 'IT211', name: 'Digital Logic Design', credits: 3, level: 2, prerequisites: ['BS115'] },
  { code: 'SE211', name: 'Introduction to Software Engineering', credits: 3, level: 2, prerequisites: ['CS112'] },
  { code: 'IS211', name: 'Introduction to Database Systems', credits: 3, level: 2, prerequisites: ['CS112'] },
  { code: 'IS212', name: 'Optimization methods', credits: 3, level: 2, prerequisites: [] },
  { code: 'IT212', name: 'Computer network Technology', credits: 3, level: 2, prerequisites: ['CS111'] },
  { code: 'CS213', name: 'Algorithm Analysis and Design', credits: 3, level: 2, prerequisites: ['CS212'] },

  // ==========================================
  // LEVEL 3: JUNIOR (Specialized Departments)
  // ==========================================
  // Shared / Cross-Department Level 3 Courses
  { code: 'IS311', name: 'Analysis and Design of Information Systems', credits: 3, level: 3, prerequisites: ['IS211'] },
  { code: 'CS311', name: 'Computer Security', credits: 3, level: 3, prerequisites: ['IT212'] },
  { code: 'CS313', name: 'Artificial Intelligence', credits: 3, level: 3, prerequisites: ['CS212'] },
  { code: 'IT311', name: 'Computer Graphic', credits: 3, level: 3, prerequisites: ['CS112'] },
  { code: 'CS316', name: 'Advanced Operating Systems', credits: 3, level: 3, prerequisites: ['CS214'] },
  { code: 'SE315', name: 'Advanced Software Engineering', credits: 3, level: 3, prerequisites: ['SE211'] },
  { code: 'IS318', name: 'Information Theory and Data Compression', credits: 3, level: 3, prerequisites: ['BS116'] },

  // CS Specific - Level 3
  { code: 'CS312', name: 'Computer Organization and Architecture', credits: 3, level: 3, prerequisites: ['IT211'] },
  { code: 'CS314', name: 'Machine Learning', credits: 3, level: 3, prerequisites: ['CS211'] },
  { code: 'CS315', name: 'Big Data Analysis', credits: 3, level: 3, prerequisites: ['IS311'] },

  // IS Specific - Level 3
  { code: 'IS312', name: 'Database Management Systems', credits: 3, level: 3, prerequisites: ['IS211'] },
  { code: 'IS313', name: 'File management and processing', credits: 3, level: 3, prerequisites: ['CS212'] },
  { code: 'IS314', name: 'Information retrieval', credits: 3, level: 3, prerequisites: ['BS115'] },
  { code: 'IS315', name: 'Data Warehousing', credits: 3, level: 3, prerequisites: ['IS311'] },
  { code: 'IS316', name: 'Data Analytics and Management', credits: 3, level: 3, prerequisites: ['IS315'] },
  { code: 'IS317', name: 'Web-based Information Systems Development', credits: 3, level: 3, prerequisites: ['CS211'] },

  // IT Specific - Level 3
  { code: 'IT312', name: 'Pattern Recognition', credits: 3, level: 3, prerequisites: ['BS117'] },
  { code: 'IT313', name: 'Information and Computer Networks Security', credits: 3, level: 3, prerequisites: ['IT111'] },
  { code: 'IT314', name: 'Signals and Systems', credits: 3, level: 3, prerequisites: ['BS114'] },
  { code: 'IT315', name: 'Microprocessors', credits: 3, level: 3, prerequisites: ['IT211'] },
  { code: 'IT316', name: 'Image processing', credits: 3, level: 3, prerequisites: ['IT314'] },
  { code: 'IT317', name: 'Advanced Computer Networks', credits: 3, level: 3, prerequisites: ['IT212'] },
  { code: 'IT318', name: 'Computer Architecture', credits: 3, level: 3, prerequisites: ['BS115'] },
  { code: 'IT319', name: 'Digital Multimedia', credits: 3, level: 3, prerequisites: ['IT311'] },

  // SE Specific - Level 3
  { code: 'SE311', name: 'Software Requirements Analysis', credits: 3, level: 3, prerequisites: ['SE211'] },
  { code: 'SE312', name: 'Software Engineering for Internet Applications', credits: 3, level: 3, prerequisites: ['SE211'] },
  { code: 'SE313', name: 'Software Design and Architecture', credits: 3, level: 3, prerequisites: ['SE311'] },
  { code: 'SE314', name: 'Software Quality Assurance', credits: 3, level: 3, prerequisites: ['SE311'] },
  { code: 'SE316', name: 'User Interface Design', credits: 3, level: 3, prerequisites: ['SE312'] },

  // ==========================================
  // LEVEL 4: SENIOR (Specialized Departments)
  // ==========================================
  // Shared Level 4 Courses
  { code: 'CS412', name: 'Internet of Things (IOT)', credits: 3, level: 4, prerequisites: ['IT212'] },
  { code: 'CS413', name: 'Problem solving and decision making', credits: 3, level: 4, prerequisites: ['CS213'] },
  { code: 'CS414', name: 'Data Science', credits: 3, level: 4, prerequisites: ['CS314'] },

  // CS Specific - Level 4
  { code: 'CS411', name: 'Computation Theory', credits: 3, level: 4, prerequisites: ['BS112'] },
  { code: 'CS415', name: 'Cloud Computing', credits: 3, level: 4, prerequisites: ['CS316'] },
  { code: 'CS416', name: 'Compilers', credits: 3, level: 4, prerequisites: ['CS411'] },
  { code: 'PR411', name: 'Graduation Project 1 (CS)', credits: 3, level: 4, prerequisites: [] },
  { code: 'PR412', name: 'Graduation Project 2 (CS)', credits: 3, level: 4, prerequisites: ['PR411'] },

  // IS Specific - Level 4
  { code: 'IS411', name: 'Data mining', credits: 3, level: 4, prerequisites: ['BS116'] },
  { code: 'IS412', name: 'Information Systems Project management', credits: 3, level: 4, prerequisites: ['IS311'] },
  { code: 'IS413', name: 'Selected Topics in Information Systems 1', credits: 3, level: 4, prerequisites: ['IS317'] },
  { code: 'IS414', name: 'Selected Topics in Databases', credits: 3, level: 4, prerequisites: ['IS312'] },
  { code: 'IS415', name: 'Information Systems Development Methodologies', credits: 3, level: 4, prerequisites: ['IS311'] },
  { code: 'PR421', name: 'Graduation Project 1 (IS)', credits: 3, level: 4, prerequisites: [] },
  { code: 'PR422', name: 'Graduation Project 2 (IS)', credits: 3, level: 4, prerequisites: ['PR421'] },

  // IT Specific - Level 4
  { code: 'IT411', name: 'Robot systems', credits: 3, level: 4, prerequisites: ['IT315'] },
  { code: 'IT413', name: 'Communication Technology', credits: 3, level: 4, prerequisites: ['IT317'] },
  { code: 'IT414', name: 'Cyber Security', credits: 3, level: 4, prerequisites: ['IT313'] },
  { code: 'IT415', name: 'Cloud Computing Networks', credits: 3, level: 4, prerequisites: ['IT111'] },
  { code: 'PR431', name: 'Graduation Project 1 (IT)', credits: 3, level: 4, prerequisites: [] },
  { code: 'PR432', name: 'Graduation Project 2 (IT)', credits: 3, level: 4, prerequisites: ['PR431'] },

  // SE Specific - Level 4
  { code: 'SE411', name: 'Software Project Management', credits: 3, level: 4, prerequisites: ['SE314'] },
  { code: 'SE412', name: 'Software testing and validation', credits: 3, level: 4, prerequisites: ['SE314'] },
  { code: 'SE413', name: 'Software Engineering Approach to Human Computer Interaction', credits: 3, level: 4, prerequisites: ['SE315'] },
  { code: 'SE415', name: 'Ethics and professional practice in software engineering', credits: 3, level: 4, prerequisites: ['SE412'] },
  { code: 'SE416', name: 'Software Evolution and Maintenance', credits: 3, level: 4, prerequisites: ['SE411'] },
  { code: 'SE417', name: 'Embedded systems software design', credits: 3, level: 4, prerequisites: ['SE412'] },
  { code: 'PR441', name: 'Graduation Project 1 (SE)', credits: 3, level: 4, prerequisites: [] },
  { code: 'PR442', name: 'Graduation Project 2 (SE)', credits: 3, level: 4, prerequisites: ['PR441'] }
];

const calculateStudentLevel = (passed_credits) => {
  if (passed_credits <= 27) return 1;
  if (passed_credits <= 62) return 2;
  if (passed_credits <= 97) return 3;
  return 4;
};

const validateCreditHours = (student, requestedCourses, semesterType = 'Regular', isGraduating = false) => {
  const currentRegisteredCredits = student.registered_courses.reduce((sum, courseCode) => {
    const course = mockCourses.find(c => c.code === courseCode);
    return sum + (course ? course.credits : 0);
  }, 0);

  const requestedCredits = requestedCourses.reduce((sum, courseCode) => {
    const course = mockCourses.find(c => c.code === courseCode);
    return sum + (course ? course.credits : 0);
  }, 0);

  const totalCredits = currentRegisteredCredits + requestedCredits;

  let minAllowed = 9;
  let maxAllowed = 18;

  if (student.gpa < 1.0) {
    maxAllowed = 12;
  } else if (student.gpa >= 1.0 && student.gpa < 2.0) {
    maxAllowed = 15;
  } else if (student.gpa >= 2.0 && student.gpa < 3.0) {
    maxAllowed = 18;
  } else if (student.gpa >= 3.0) {
    maxAllowed = 21;
  }

  if (semesterType === 'Summer') {
    minAllowed = 0;
    maxAllowed = 9;
  }

  if (isGraduating) {
    if (semesterType === 'Summer') {
      maxAllowed = 12;
    } else {
      minAllowed = 0;
      maxAllowed = 21;
    }
  }

  if (totalCredits < minAllowed) {
    return { valid: false, message: `Minimum required credit hours is ${minAllowed}. Total would be ${totalCredits}.` };
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

  const passedCredits = student.passed_courses.reduce((sum, courseCode) => {
    const course = mockCourses.find(c => c.code === courseCode);
    return sum + (course ? course.credits : 0);
  }, 0);

  const studentLevel = calculateStudentLevel(passedCredits);

  const suggested = mockCourses.filter(course => {
    if (student.passed_courses.includes(course.code)) return false;

    if (student.registered_courses.includes(course.code)) return false;

    if (course.level > studentLevel) return false;

    const prereqCheck = checkPrerequisites(student, course.code);
    return prereqCheck.valid;
  });

  return suggested;
};

const registerForCourses = (studentId, requestedCourses, semesterType = 'Regular', isGraduating = false) => {
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

  const creditCheck = validateCreditHours(student, requestedCourses, semesterType, isGraduating);
  if (!creditCheck.valid) {
    throw new AppError(creditCheck.message, 400);
  }

  student.registered_courses.push(...requestedCourses);

  return student.registered_courses;
};

module.exports = {
  calculateStudentLevel,
  validateCreditHours,
  checkPrerequisites,
  suggestCourses,
  registerForCourses
};
