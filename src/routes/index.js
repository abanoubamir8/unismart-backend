const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const defaultCourses = [
    // Level 1
    { code: 'CS111', name: 'Fundamentals of Computer Science', credits: 3, level: 1, prerequisites: [], professor: 'Dr. Osama', capacity: 60, status: 'Available' },
    { code: 'CS112', name: 'Structured Programming', credits: 3, level: 1, prerequisites: ['CS111'], professor: 'Dr. Mona', capacity: 60, status: 'Available' },
    { code: 'BS111', name: 'Math 1', credits: 3, level: 1, prerequisites: [], professor: 'Dr. Ayman', capacity: 60, status: 'Available' },
    { code: 'BS113', name: 'Math 2', credits: 3, level: 1, prerequisites: ['BS111'], professor: 'Dr. Ayman', capacity: 60, status: 'Available' },
    { code: 'UNV112', name: 'Societal Issues', credits: 2, level: 1, prerequisites: [], professor: 'Dr. Ahmed', capacity: 60, status: 'Available' },

    // Level 2
    { code: 'CS211', name: 'Object Oriented Programming', credits: 3, level: 2, prerequisites: ['CS112'], professor: 'Dr. Yasser', capacity: 60, status: 'Available' },
    { code: 'CS212', name: 'Data Structures', credits: 3, level: 2, prerequisites: ['CS112'], professor: 'Dr. Osama', capacity: 60, status: 'Available' },
    { code: 'IS211', name: 'Introduction to Database Systems', credits: 3, level: 2, prerequisites: ['CS112'], professor: 'Dr. Noha', capacity: 60, status: 'Available' },
    { code: 'SE211', name: 'Introduction to Software Engineering', credits: 3, level: 2, prerequisites: ['CS112'], professor: 'Dr. Rania', capacity: 60, status: 'Available' },
    { code: 'BS211', name: 'Math 3', credits: 3, level: 2, prerequisites: ['BS113'], professor: 'Dr. Samy', capacity: 60, status: 'Available' },

    // Level 3
    { code: 'CS313', name: 'Artificial Intelligence', credits: 3, level: 3, prerequisites: ['CS212', 'BS113'], professor: 'Dr. Hany', capacity: 60, status: 'Available' },
    { code: 'CS314', name: 'Machine Learning', credits: 3, level: 3, prerequisites: ['CS313'], professor: 'Dr. Tarek', capacity: 60, status: 'Available' },
    { code: 'SE311', name: 'Advanced Software Engineering', credits: 3, level: 3, prerequisites: ['SE211', 'CS211'], professor: 'Dr. Rania', capacity: 60, status: 'Available' },
    { code: 'CS311', name: 'Computer Security', credits: 3, level: 3, prerequisites: ['CS212'], professor: 'Dr. Tarek', capacity: 60, status: 'Available' },

    // Level 4
    { code: 'CS414', name: 'Data Science', credits: 3, level: 4, prerequisites: ['CS314'], professor: 'Dr. Yasser', capacity: 60, status: 'Available' },
    { code: 'CS415', name: 'Cloud Computing', credits: 3, level: 4, prerequisites: ['CS311'], professor: 'Dr. Osama', capacity: 60, status: 'Available' },
    { code: 'PR411', name: 'Graduation Project 1', credits: 3, level: 4, prerequisites: [], professor: 'Dr. Mona', capacity: 60, status: 'Available' },
    { code: 'PR412', name: 'Graduation Project 2', credits: 3, level: 4, prerequisites: ['PR411'], professor: 'Dr. Hany', capacity: 60, status: 'Available' }
];

const defaultLogs = [];

const defaultAdmins = [
    { username: "admin01", password: "admin@2026", name: "System Administrator" }
];

const defaultStudents = [
    {
        // Student 1 (The Freshman)
        student_id: "2026101",
        password: "123",
        name: 'Ahmed Freshman',
        email: 'ahmed@university.edu',
        gpa: 0.0,
        passed_hours: 0,
        department: 'General',
        registered_courses: [],
        academic_history: []
    },
    {
        // Student 2 (The Junior - Abanoub)
        student_id: "2026001",
        password: "123",
        name: 'Abanoub Amir',
        email: 'abanoubamir@university.edu',
        gpa: 3.4,
        passed_hours: 65, // Level 3 threshold
        department: 'Computer Science',
        registered_courses: ['SE311', 'CS313'],
        academic_history: [
            { course_code: 'CS111', semester: 'First 2024', grade: 90, recognition: 'A' },
            { course_code: 'BS111', semester: 'First 2024', grade: 80, recognition: 'B' },
            { course_code: 'CS112', semester: 'Second 2024', grade: 85, recognition: 'B+' },
            { course_code: 'BS113', semester: 'Second 2024', grade: 88, recognition: 'B+' },
            { course_code: 'CS212', semester: 'First 2025', grade: 92, recognition: 'A-' },
            { course_code: 'CS211', semester: 'First 2025', grade: 89, recognition: 'B+' },
            { course_code: 'SE211', semester: 'Second 2025', grade: 85, recognition: 'B+' }
        ]
    },
    {
        // Student 3 (The Senior)
        student_id: "2026901",
        password: "123",
        name: 'Sara Senior',
        email: 'sara@university.edu',
        gpa: 3.9,
        passed_hours: 105, // Level 4 threshold
        department: 'Computer Science',
        registered_courses: ['CS414', 'PR412'],
        academic_history: [
            { course_code: 'CS111', semester: 'First 2022', grade: 95, recognition: 'A' },
            { course_code: 'CS112', semester: 'Second 2022', grade: 98, recognition: 'A+' },
            { course_code: 'BS111', semester: 'First 2022', grade: 95, recognition: 'A' },
            { course_code: 'BS113', semester: 'Second 2022', grade: 90, recognition: 'A-' },
            { course_code: 'CS212', semester: 'First 2023', grade: 96, recognition: 'A' },
            { course_code: 'CS211', semester: 'First 2023', grade: 97, recognition: 'A+' },
            { course_code: 'CS313', semester: 'Second 2023', grade: 99, recognition: 'A+' },
            { course_code: 'CS314', semester: 'First 2024', grade: 100, recognition: 'A+' },
            { course_code: 'PR411', semester: 'First 2025', grade: 95, recognition: 'A' }
        ]
    },
    {
        // Student 4 (The Probation Student)
        student_id: "2026404",
        password: "123",
        name: 'Kareem Probation',
        email: 'kareem@university.edu',
        gpa: 1.5,
        passed_hours: 45, // Level 2
        department: 'Computer Science',
        registered_courses: ['IS211'],
        academic_history: [
            { course_code: 'CS111', semester: 'First 2024', grade: 65, recognition: 'D' },
            { course_code: 'CS112', semester: 'Second 2024', grade: 60, recognition: 'D' }
        ]
    },
    {
        // Student 5 (The Missing Prereq)
        student_id: "2026505",
        password: "123",
        name: 'Mona Missing',
        email: 'mona@university.edu',
        gpa: 2.8,
        passed_hours: 90, // Level 3
        department: 'Computer Science',
        registered_courses: [],
        academic_history: [
            { course_code: 'CS111', semester: 'First 2023', grade: 90, recognition: 'A' },
            { course_code: 'CS112', semester: 'Second 2023', grade: 85, recognition: 'B+' },
            { course_code: 'CS211', semester: 'First 2024', grade: 85, recognition: 'B+' },
            { course_code: 'BS111', semester: 'First 2024', grade: 80, recognition: 'B' },
            { course_code: 'BS113', semester: 'Second 2024', grade: 88, recognition: 'B+' }
        ]
    }
];

const loadData = (filename, defaultData) => {
    try {
        const filePath = path.join(dataDir, filename);
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            if (raw.trim() === '') return defaultData;
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error(`Error parsing ${filename}:`, e);
    }
    return defaultData;
};

let mockCourses = loadData('courses.json', defaultCourses);
let mockStudents = loadData('students.json', defaultStudents);
let globalRegistrationLog = loadData('logs.json', defaultLogs);
let mockAdmins = loadData('admins.json', defaultAdmins);

const saveToDisk = () => {
    try {
        fs.writeFileSync(path.join(dataDir, 'courses.json'), JSON.stringify(mockCourses, null, 2));
        fs.writeFileSync(path.join(dataDir, 'students.json'), JSON.stringify(mockStudents, null, 2));
        fs.writeFileSync(path.join(dataDir, 'logs.json'), JSON.stringify(globalRegistrationLog, null, 2));
        fs.writeFileSync(path.join(dataDir, 'admins.json'), JSON.stringify(mockAdmins, null, 2));
    } catch (err) {
        console.error("Failed to save data:", err);
    }
};

// Initial save to create files if they don't exist
saveToDisk();

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

    const admin = mockAdmins.find(a => a.username === university_id && a.password === password);
    if (admin) {
        return res.status(200).json({
            success: true,
            role: "admin",
            name: admin.name,
            token: "fake-admin-jwt-token"
        });
    }

    const student = mockStudents.find(s => s.student_id === university_id && s.password === password);
    if (student) {
        return res.status(200).json({
            success: true,
            role: "student",
            message: "Login successful",
            student_data: { name: student.name, gpa: student.gpa, department: student.department },
            token: "fake-student-jwt-token"
        });
    }

    res.status(401).json({
        success: false,
        message: "Invalid university ID or password",
        errorCode: "INVALID_CREDENTIALS"
    });
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
                return res.status(400).json({ success: false, message: `Registration failed: ${course.name} (${course.code}) requires Level ${course.level}, but you are currently Level ${studentLevel}.` });
            }

            // Strictly check prerequisites
            for (const prereq of course.prerequisites) {
                if (!passedCodes.includes(prereq)) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot register for ${course.name}. You must pass ${prereq} first.`,
                        errorCode: "PREREQUISITE_MISSING"
                    });
                }
            }
        }

        student.registered_courses.push(...requested_courses);
        
        requested_courses.forEach(code => {
            const course = mockCourses.find(c => c.code === code);
            globalRegistrationLog.unshift({
                student_id: student.student_id,
                student_name: student.name,
                course_code: code,
                course_name: course ? course.name : code,
                timestamp: new Date().toISOString()
            });
        });

        saveToDisk();
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
        saveToDisk();
        res.status(200).json({ 
            success: true, 
            message: 'Course removed', 
            updated_registered_courses: student.registered_courses 
        });
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

const requireAdmin = (req, res, next) => {
    if (req.headers['x-user-role'] === 'admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
};

// --- ADMIN ROUTES ---
router.use('/api/admin', requireAdmin);

// Stats
router.post('/api/admin/stats', (req, res) => {
    const total_students = mockStudents.length;
    const total_courses = mockCourses.length;
    const active_registrations = mockStudents.reduce((sum, s) => sum + s.registered_courses.length, 0);
    const departments_count = new Set(mockStudents.map(s => s.department)).size;

    res.status(200).json({
        total_students,
        total_courses,
        active_registrations,
        departments_count,
        recent_registrations: globalRegistrationLog.slice(0, 5)
    });
});

// Student Management
router.get('/api/admin/students', (req, res) => {
    res.status(200).json(mockStudents);
});
router.post('/api/admin/students/list', (req, res) => {
    res.status(200).json(mockStudents);
});
router.post('/api/admin/students', (req, res) => {
    const newStudent = { ...req.body, registered_courses: req.body.registered_courses || [], academic_history: req.body.academic_history || [] };
    mockStudents.push(newStudent);
    saveToDisk();
    res.status(201).json(newStudent);
});
router.put('/api/admin/students/:id', (req, res) => {
    const studentIndex = mockStudents.findIndex(s => s.student_id === req.params.id);
    if (studentIndex === -1) return res.status(404).json({ message: "Student not found" });
    mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...req.body };
    saveToDisk();
    res.status(200).json(mockStudents[studentIndex]);
});
router.delete('/api/admin/students/:id', (req, res) => {
    const studentIndex = mockStudents.findIndex(s => s.student_id === req.params.id);
    if (studentIndex === -1) return res.status(404).json({ message: "Student not found" });
    mockStudents.splice(studentIndex, 1);
    saveToDisk();
    res.status(200).json({ message: "Student removed" });
});
router.put('/api/admin/students/:id/delete', (req, res) => {
    const studentIndex = mockStudents.findIndex(s => s.student_id === req.params.id);
    if (studentIndex === -1) return res.status(404).json({ message: "Student not found" });
    mockStudents.splice(studentIndex, 1);
    saveToDisk();
    res.status(200).json({ message: "Student removed" });
});

// Course Management
router.get('/api/admin/courses', (req, res) => {
    const coursesWithCapacityInfo = mockCourses.map(c => {
        const current_enrollment = mockStudents.filter(s => s.registered_courses.includes(c.code)).length;
        return { ...c, current_enrollment, capacity_label: `${current_enrollment}/${c.capacity || 60}` };
    });
    res.status(200).json(coursesWithCapacityInfo);
});
router.post('/api/admin/courses/list', (req, res) => {
    const coursesWithCapacityInfo = mockCourses.map(c => {
        const current_enrollment = mockStudents.filter(s => s.registered_courses.includes(c.code)).length;
        return { ...c, current_enrollment, capacity_label: `${current_enrollment}/${c.capacity || 60}` };
    });
    res.status(200).json(coursesWithCapacityInfo);
});
router.post('/api/admin/courses', (req, res) => {
    const newCourse = { capacity: 60, status: 'Available', prerequisites: [], ...req.body };
    mockCourses.push(newCourse);
    saveToDisk();
    res.status(201).json(newCourse);
});
router.put('/api/admin/courses/:code', (req, res) => {
    const courseIndex = mockCourses.findIndex(c => c.code === req.params.code);
    if (courseIndex === -1) return res.status(404).json({ message: "Course not found" });
    mockCourses[courseIndex] = { ...mockCourses[courseIndex], ...req.body };
    saveToDisk();
    res.status(200).json(mockCourses[courseIndex]);
});
router.delete('/api/admin/courses/:code', (req, res) => {
    const courseIndex = mockCourses.findIndex(c => c.code === req.params.code);
    if (courseIndex === -1) return res.status(404).json({ message: "Course not found" });
    mockCourses.splice(courseIndex, 1);
    saveToDisk();
    res.status(200).json({ message: "Course removed" });
});
router.put('/api/admin/courses/:code/delete', (req, res) => {
    const courseIndex = mockCourses.findIndex(c => c.code === req.params.code);
    if (courseIndex === -1) return res.status(404).json({ message: "Course not found" });
    mockCourses.splice(courseIndex, 1);
    saveToDisk();
    res.status(200).json({ message: "Course removed" });
});

module.exports = router;