const db = require('../models/jsonDatabase');
const { calculateLevel, getGpaMaxHours } = require('../utils/academicUtils');

exports.getAvailableCourses = (req, res, next) => {
    try {
        const { universityId } = req.body;
        const student = db.students.find(s => s.studentId === universityId);
        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; err.errorCode = 'STUDENT_NOT_FOUND';
            return next(err);
        }

        const passedCodes = student.academicHistory.map(h => h.courseCode);
        const studentLevel = calculateLevel(student.passedHours);

        const suggested = db.courses.map(course => {
            if (passedCodes.includes(course.code)) return null;
            if (student.registeredCourses.includes(course.code)) return null;

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
                isLocked,
                lockReason
            };
        }).filter(course => course !== null);

        res.status(200).json(suggested);
    } catch (error) {
        next(error);
    }
};

exports.registerCourse = (req, res, next) => {
    try {
        const { universityId, requestedCourses } = req.body;
        const student = db.students.find(s => s.studentId === universityId);
        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; return next(err);
        }

        if (!Array.isArray(requestedCourses)) {
            const err = new Error('requestedCourses must be an array');
            err.statusCode = 400; return next(err);
        }

        const passedCodes = student.academicHistory.map(h => h.courseCode);
        const studentLevel = calculateLevel(student.passedHours);

        for (const courseCode of requestedCourses) {
            const course = db.courses.find(c => c.code === courseCode);
            if (!course) {
                const err = new Error(`Course ${courseCode} not found`);
                err.statusCode = 404; return next(err);
            }
            if (passedCodes.includes(courseCode)) {
                const err = new Error(`Already passed course: ${courseCode}`);
                err.statusCode = 400; return next(err);
            }
            if (student.registeredCourses.includes(courseCode)) {
                const err = new Error(`Already registered for course: ${courseCode}`);
                err.statusCode = 400; return next(err);
            }
            if (course.level > studentLevel) {
                const err = new Error(`Registration failed: ${course.name} (${course.code}) requires Level ${course.level}, but you are currently Level ${studentLevel}.`);
                err.statusCode = 400; return next(err);
            }

            for (const prereq of course.prerequisites) {
                if (!passedCodes.includes(prereq)) {
                    const err = new Error(`Cannot register for ${course.name}. You must pass ${prereq} first.`);
                    err.statusCode = 400; err.errorCode = "PREREQUISITE_MISSING";
                    return next(err);
                }
            }
        }

        student.registeredCourses.push(...requestedCourses);
        
        requestedCourses.forEach(code => {
            const course = db.courses.find(c => c.code === code);
            db.logs.unshift({
                studentId: student.studentId,
                studentName: student.name,
                courseCode: code,
                courseName: course ? course.name : code,
                timestamp: new Date().toISOString()
            });
        });

        db.saveToDisk();
        res.status(200).json(student.registeredCourses);
    } catch (error) {
        next(error);
    }
};

exports.unregisterCourse = (req, res, next) => {
    try {
        const { universityId, courseCode } = req.body;
        const student = db.students.find(s => s.studentId === universityId);

        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; return next(err);
        }

        const courseIndex = student.registeredCourses.indexOf(courseCode);
        if (courseIndex === -1) {
            const err = new Error('Course is not in your current registration list');
            err.statusCode = 404; return next(err);
        }

        student.registeredCourses.splice(courseIndex, 1);
        db.saveToDisk();
        res.status(200).json({ 
            success: true, 
            message: 'Course removed', 
            updatedRegisteredCourses: student.registeredCourses 
        });
    } catch (error) {
        next(error);
    }
};

exports.getTimetable = (req, res, next) => {
    try {
        const { universityId } = req.body;
        const student = db.students.find(s => s.studentId === universityId);

        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; err.errorCode = 'STUDENT_NOT_FOUND';
            return next(err);
        }

        const timetable = student.registeredCourses.map((code, index) => {
            const course = db.courses.find(c => c.code === code);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
            return {
                courseCode: course ? course.code : code,
                courseName: course ? course.name : code,
                day: days[index % days.length],
                time: '10:00 AM - 12:00 PM',
                location: `Lab ${index + 1}`
            };
        });

        res.status(200).json(timetable);
    } catch (error) {
        next(error);
    }
};

exports.getProfile = (req, res, next) => {
    try {
        const { universityId } = req.body;
        const student = db.students.find(s => s.studentId === universityId);

        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; return next(err);
        }

        const level = calculateLevel(student.passedHours);
        const yearMapping = {
            1: "First Year",
            2: "Second Year",
            3: "Third Year",
            4: "Fourth Year"
        };

        res.status(200).json({
            name: student.name,
            email: student.email,
            yearOfStudy: yearMapping[level] || "Unknown",
            department: student.department,
            studentId: student.studentId,
            gpa: student.gpa
        });
    } catch (error) {
        next(error);
    }
};

exports.getGrades = (req, res, next) => {
    try {
        const { universityId } = req.body;
        const student = db.students.find(s => s.studentId === universityId);

        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; return next(err);
        }

        const grades = student.academicHistory.map(history => {
            const course = db.courses.find(c => c.code === history.courseCode);
            return {
                courseName: course ? course.name : history.courseCode,
                semester: history.semester,
                grade: history.grade,
                recognition: history.recognition
            };
        });

        res.status(200).json(grades);
    } catch (error) {
        next(error);
    }
};

exports.getDashboard = (req, res, next) => {
    try {
        const { universityId } = req.body;
        const student = db.students.find(s => s.studentId === universityId);

        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; return next(err);
        }

        const availableHours = getGpaMaxHours(student.gpa);

        const registeredCoursesDetails = student.registeredCourses.map(code => {
            const course = db.courses.find(c => c.code === code);
            return {
                code: code,
                courseName: course ? course.name : code,
                hours: course ? course.credits : 3,
                professor: course ? course.professor : 'TBA',
                action: 'Delete'
            };
        });

        res.status(200).json({
            gpa: student.gpa,
            availableHours,
            passedHours: student.passedHours,
            registeredCoursesCount: student.registeredCourses.length,
            registeredCoursesDetails
        });
    } catch (error) {
        next(error);
    }
};
