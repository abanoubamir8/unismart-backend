const express = require('express');
const router = express.Router();

const mockCourses = [
    { code: 'CS111', name: 'Fundamentals of Computer Science', credits: 3, level: 1, prerequisites: [], professor: 'Dr. Osama' },
    { code: 'CS112', name: 'Structured Programming', credits: 3, level: 1, prerequisites: ['CS111'], professor: 'Dr. Mona' },
    { code: 'CS211', name: 'Object Oriented Programming', credits: 3, level: 2, prerequisites: ['CS112'], professor: 'Dr. Yasser' },
    { code: 'CS212', name: 'Data Structures', credits: 3, level: 2, prerequisites: ['CS112'], professor: 'Dr. Osama' },
    { code: 'CS313', name: 'Artificial Intelligence', credits: 3, level: 3, prerequisites: ['CS212'], professor: 'Dr. Hany' },
    { code: 'CS314', name: 'Machine Learning', credits: 3, level: 3, prerequisites: ['CS211'], professor: 'Dr. Tarek' }
];

const mockStudents = [
    {
        student_id: "2026001",
        password: "123",
        name: 'Abanoub Amir',
        email: 'abanoubamir@university.edu',
        gpa: 3.4,
        passed_hours: 65, // Level 3 threshold so level constraints don't hide prerequisite blocks
        department: 'Computer Science',
        registered_courses: ['CS212'],
        academic_history: [
            { course_code: 'CS111', semester: 'First 2024', grade: 90, recognition: 'A' },
            { course_code: 'CS112', semester: 'Second 2024', grade: 85, recognition: 'B+' }
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

        const suggested = mockCourses.map(course => {
            if (passedCodes.includes(course.code)) return null;
            if (student.registered_courses.includes(course.code)) return null;

            let isLocked = false;
            let lockReason = null;

            if (course.level > studentLevel) {
                isLocked = true;
                lockReason = `Semester Level ${course.level} Required`;
            }

            for (const prereq of course.prerequisites) {
                if (!passedCodes.includes(prereq)) {
                    isLocked = true;
                    lockReason = `Prerequisite Missing: ${prereq}`;
                    break;
                }
            }
            
            return {
                ...course,
                is_locked: isLocked,
                lock_reason: lockReason
            };
        }).filter(course => course !== null);

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
        const { university_id, requested_courses } = req.body;
        const student = mockStudents.find(s => s.student_id === university_id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        if (!Array.isArray(requested_courses)) {
            return res.status(400).json({ success: false, message: 'requested_courses must be an array' });
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

            // Strictly check prerequisites
            for (const prereq of course.prerequisites) {
                if (!passedCodes.includes(prereq)) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Prerequisite missing: You must pass ${prereq} before registering for ${courseCode}.`,
                        errorCode: "PREREQUISITE_MISSING"
                    });
                }
            }
        }

        student.registered_courses.push(...requested_courses);
        res.status(200).json(student.registered_courses);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/api/unregister-course', (req, res) => {
    try {
        const { university_id, course_code } = req.body;
        const student = mockStudents.find(s => s.student_id === university_id);
        
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const courseIndex = student.registered_courses.indexOf(course_code);
        if (courseIndex === -1) {
            return res.status(404).json({ success: false, message: 'Course is not in your current registration list' });
        }

        student.registered_courses.splice(courseIndex, 1);
        res.status(200).json({ success: true, message: 'Course unregistered successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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