const fs = require('fs');
const path = require('path');

const dataDir = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(__dirname, '../../data');
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
        studentId: "2026101",
        password: "123",
        name: 'Ahmed Freshman',
        email: 'ahmed@university.edu',
        gpa: 0.0,
        passedHours: 0,
        department: 'General',
        registeredCourses: [],
        academicHistory: []
    },
    {
        studentId: "2026001",
        password: "123",
        name: 'Abanoub Amir',
        email: 'abanoubamir@university.edu',
        gpa: 3.4,
        passedHours: 65,
        department: 'Computer Science',
        registeredCourses: ['SE311', 'CS313'],
        academicHistory: [
            { courseCode: 'CS111', semester: 'First 2024', grade: 90, recognition: 'A' },
            { courseCode: 'BS111', semester: 'First 2024', grade: 80, recognition: 'B' },
            { courseCode: 'CS112', semester: 'Second 2024', grade: 85, recognition: 'B+' },
            { courseCode: 'BS113', semester: 'Second 2024', grade: 88, recognition: 'B+' },
            { courseCode: 'CS212', semester: 'First 2025', grade: 92, recognition: 'A-' },
            { courseCode: 'CS211', semester: 'First 2025', grade: 89, recognition: 'B+' },
            { courseCode: 'SE211', semester: 'Second 2025', grade: 85, recognition: 'B+' }
        ]
    },
    {
        studentId: "2026901",
        password: "123",
        name: 'Sara Senior',
        email: 'sara@university.edu',
        gpa: 3.9,
        passedHours: 105,
        department: 'Computer Science',
        registeredCourses: ['CS414', 'PR412'],
        academicHistory: [
            { courseCode: 'CS111', semester: 'First 2022', grade: 95, recognition: 'A' },
            { courseCode: 'CS112', semester: 'Second 2022', grade: 98, recognition: 'A+' },
            { courseCode: 'BS111', semester: 'First 2022', grade: 95, recognition: 'A' },
            { courseCode: 'BS113', semester: 'Second 2022', grade: 90, recognition: 'A-' },
            { courseCode: 'CS212', semester: 'First 2023', grade: 96, recognition: 'A' },
            { courseCode: 'CS211', semester: 'First 2023', grade: 97, recognition: 'A+' },
            { courseCode: 'CS313', semester: 'Second 2023', grade: 99, recognition: 'A+' },
            { courseCode: 'CS314', semester: 'First 2024', grade: 100, recognition: 'A+' },
            { courseCode: 'PR411', semester: 'First 2025', grade: 95, recognition: 'A' }
        ]
    },
    {
        studentId: "2026404",
        password: "123",
        name: 'Kareem Probation',
        email: 'kareem@university.edu',
        gpa: 1.5,
        passedHours: 45,
        department: 'Computer Science',
        registeredCourses: ['IS211'],
        academicHistory: [
            { courseCode: 'CS111', semester: 'First 2024', grade: 65, recognition: 'D' },
            { courseCode: 'CS112', semester: 'Second 2024', grade: 60, recognition: 'D' }
        ]
    },
    {
        studentId: "2026505",
        password: "123",
        name: 'Mona Missing',
        email: 'mona@university.edu',
        gpa: 2.8,
        passedHours: 90,
        department: 'Computer Science',
        registeredCourses: [],
        academicHistory: [
            { courseCode: 'CS111', semester: 'First 2023', grade: 90, recognition: 'A' },
            { courseCode: 'CS112', semester: 'Second 2023', grade: 85, recognition: 'B+' },
            { courseCode: 'CS211', semester: 'First 2024', grade: 85, recognition: 'B+' },
            { courseCode: 'BS111', semester: 'First 2024', grade: 80, recognition: 'B' },
            { courseCode: 'BS113', semester: 'Second 2024', grade: 88, recognition: 'B+' }
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
        // Error logging removed for production cleanup
    }
    return defaultData;
};

const db = {
    courses: loadData('courses.json', defaultCourses),
    students: loadData('students.json', defaultStudents),
    logs: loadData('logs.json', defaultLogs),
    admins: loadData('admins.json', defaultAdmins),

    saveToDisk: () => {
        if (process.env.NODE_ENV === 'production') {
            return;
        }

        try {
            fs.writeFileSync(path.join(dataDir, 'courses.json'), JSON.stringify(db.courses, null, 2));
            fs.writeFileSync(path.join(dataDir, 'students.json'), JSON.stringify(db.students, null, 2));
            fs.writeFileSync(path.join(dataDir, 'logs.json'), JSON.stringify(db.logs, null, 2));
            fs.writeFileSync(path.join(dataDir, 'admins.json'), JSON.stringify(db.admins, null, 2));
        } catch (err) {
            // Error logging removed for production cleanup
        }
    }
};

db.saveToDisk();

module.exports = db;
