const express = require('express');
const router = express.Router();

const mockCourses = [
  { code: 'UNV112', name: 'Societal Issues', credits: 2, level: 1, prerequisites: [], professor: 'Dr. Ahmed' },
  { code: 'CS111', name: 'Fundamentals of CS', credits: 3, level: 1, prerequisites: [], professor: 'Dr. Osama' },
  { code: 'CS112', name: 'Structured Programming', credits: 3, level: 1, prerequisites: ['CS111'], professor: 'Dr. Mona' },
  { code: 'CS212', name: 'Data Structures', credits: 3, level: 2, prerequisites: ['CS112'], professor: 'Dr. Osama' },
  { code: 'CS311', name: 'Computer Security', credits: 3, level: 3, prerequisites: ['IT212'], professor: 'Dr. Tarek' },
  { code: 'CS313', name: 'Artificial Intelligence', credits: 3, level: 3, prerequisites: ['CS212'], professor: 'Dr. Hany' }
];

const mockStudents = [
  { 
    student_id: "2026001", 
    password: "123",
    name: 'Muhammad Abdulqader',
    email: 'm.abdulqader@university.edu',
    gpa: 3.4, 
    passed_hours: 30,
    department: 'Computer Science',
    registered_courses: ['CS311', 'CS313'],
    academic_history: [
      { course_code: 'CS111', semester: 'First 2024', grade: 90, recognition: 'A' },
      { code: 'CS112', semester: 'Second 2024', grade: 85, recognition: 'B+' },
      { code: 'CS212', semester: 'First 2025', grade: 97, recognition: 'A+' }
    ]
  }
];

const calculateLevel = (hours) => {
  if (hours < 28) return 1;
  if (hours < 63) return 2;
  if (hours < 98) return 3;
  return 4;
};

const getGpaMaxHours = (gpa) => {
  if (gpa < 1.0) return 12;
  if (gpa >= 1.0 && gpa < 2.0) return 15;
  if (gpa >= 2.0 && gpa < 3.0) return 18;
  return 21;
};

router.post('/api/login', (req, res) => {
    const { university_id, password } = req.body;
    const student = mockStudents.find(s => s.student_id === university_id && s.password === password);

    if (student) {
        res.status(200).json({
            message: "Login successful",
            student: { name: student.name, gpa: student.gpa, department: student.department },
            token: "fake-jwt-token"
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Invalid university ID or password",
            errorCode: "INVALID_CREDENTIALS"
        });
    }
});

router.post('/api/courses/available', (req, res) => {
    try {
        const { university_id } = req.body;
        const student = mockStudents.find(s => s.student_id === university_id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found', errorCode: 'STUDENT_NOT_FOUND' });
        }

        const passedCodes = student.academic_history.map(h => h.course_code || h.code);
        const studentLevel = calculateLevel(student.passed_hours);

        const suggested = mockCourses.filter(course => {
            if (passedCodes.includes(course.code)) return false;
            if (student.registered_courses.includes(course.code)) return false;
            
            if (course.level > studentLevel) return false;

            for (const prereq of course.prerequisites) {
                if (!passedCodes.includes(prereq)) {
                    return false;
                }
            }
            return true;
        });

        res.status(200).json(suggested);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errorCode: "UNKNOWN_ERROR"
        });
    }
});

router.post('/api/register-course', (req, res) => {
    try {
        const { university_id, requested_courses, semesterType, isGraduating } = req.body;
        const student = mockStudents.find(s => s.student_id === university_id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        const passedCodes = student.academic_history.map(h => h.course_code || h.code);
        const studentLevel = calculateLevel(student.passed_hours);

        for (const courseCode of requested_courses) {
            const course = mockCourses.find(c => c.code === courseCode);
            if (!course) {
                return res.status(404).json({ success: false, message: `Course ${courseCode} not found` });
            }
            if (passedCodes.includes(courseCode)) {
                return res.status(400).json({ success: false, message: `Already passed course: ${courseCode}` });
            }
            if (student.registered_courses.includes(courseCode)) {
                return res.status(400).json({ success: false, message: `Already registered for course: ${courseCode}` });
            }
            if (course.level > studentLevel) {
                return res.status(400).json({ success: false, message: `This course is Level ${course.level}. You are currently Level ${studentLevel}.` });
            }
            for (const prereq of course.prerequisites) {
                if (!passedCodes.includes(prereq)) {
                    return res.status(400).json({ success: false, message: `Cannot register for ${course.name}. You must pass ${prereq} first.` });
                }
            }
        }

        student.registered_courses.push(...requested_courses);
        res.status(200).json({ message: "Courses registered successfully!", registered: student.registered_courses });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
            errorCode: "UNKNOWN_ERROR"
        });
    }
});

router.post('/api/timetable', (req, res) => {
    const { university_id } = req.body;
    const student = mockStudents.find(s => s.student_id === university_id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Student not found",
            errorCode: "STUDENT_NOT_FOUND"
        });
    }

    const timetable = student.registered_courses.map((code, index) => {
        const course = mockCourses.find(c => c.code === code);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        return {
            course_code: course ? course.code : code,
            course_name: course ? course.name : code,
            day: days[index % days.length],
            time: '10:00 AM - 12:00 PM',
            location: `Lab ${index + 1}`
        };
    });

    res.status(200).json(timetable);
});

router.post('/api/profile', (req, res) => {
    const { university_id } = req.body;
    const student = mockStudents.find(s => s.student_id === university_id);

    if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
    }

    const level = calculateLevel(student.passed_hours);
    const yearMapping = {
        1: "First Year",
        2: "Second Year",
        3: "Third Year",
        4: "Fourth Year"
    };

    res.status(200).json({
        name: student.name,
        email: student.email,
        year_of_study: yearMapping[level] || "Unknown",
        department: student.department,
        student_id: student.student_id,
        gpa: student.gpa
    });
});

router.post('/api/grades', (req, res) => {
    const { university_id } = req.body;
    const student = mockStudents.find(s => s.student_id === university_id);

    if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
    }

    const grades = student.academic_history.map(history => {
        const courseCode = history.course_code || history.code;
        const course = mockCourses.find(c => c.code === courseCode);
        return {
            course_name: course ? course.name : courseCode,
            semester: history.semester,
            grade: history.grade,
            recognition: history.recognition
        };
    });

    res.status(200).json(grades);
});

router.post('/api/dashboard', (req, res) => {
    const { university_id } = req.body;
    const student = mockStudents.find(s => s.student_id === university_id);

    if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
    }

    const available_hours = getGpaMaxHours(student.gpa);
    
    const registered_courses_details = student.registered_courses.map(code => {
        const course = mockCourses.find(c => c.code === code);
        return {
            code: code,
            course_name: course ? course.name : code,
            hours: course ? course.credits : 3,
            professor: course ? course.professor : 'TBA',
            action: 'Delete'
        };
    });

    res.status(200).json({
        gpa: student.gpa,
        available_hours: available_hours,
        passed_hours: student.passed_hours,
        registered_courses_count: student.registered_courses.length,
        registered_courses_details: registered_courses_details
    });
});

module.exports = router;