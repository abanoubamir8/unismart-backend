const prisma = require('../prisma');
const { calculateLevel, getGpaMaxHours } = require('../utils/helpers');

exports.getAvailableCourses = async (req, res, next) => {
    try {
        const { universityId } = req.body;
        const student = await prisma.student.findUnique({ where: { universityId } });
        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; err.errorCode = 'STUDENT_NOT_FOUND';
            return next(err);
        }

        const { term } = req.query;
        let whereClause = {};
        if (term) {
            whereClause.term = parseInt(term, 10);
        }

        const courses = await prisma.course.findMany({ where: whereClause });
        
        const academicHistory = (typeof student.academicHistory === 'string') ? JSON.parse(student.academicHistory) : student.academicHistory;
        const passedCodes = (academicHistory || [])
            .filter(h => h.recognition !== 'F' && h.grade >= 50)
            .map(h => h.courseCode);
            
        const studentLevel = calculateLevel(student.passedHours);

        const suggested = courses.map(course => {
            if (passedCodes.includes(course.code)) return null;
            if (student.registeredCourses.includes(course.code)) return null;

            let isLocked = false;
            let lockReason = null;

            if (course.level > studentLevel) {
                isLocked = true;
                lockReason = `Semester Level ${course.level} Required`;
            }

            const prereqsArray = typeof course.prerequisites === 'string' && course.prerequisites.trim() !== '' 
                ? course.prerequisites.split(',').map(s => s.trim()) 
                : (Array.isArray(course.prerequisites) ? course.prerequisites : []);

            for (const prereqCode of prereqsArray) {
                if (!passedCodes.includes(prereqCode)) {
                    isLocked = true;
                    const prereqCourse = courses.find(c => c.code === prereqCode);
                    const prereqName = prereqCourse ? prereqCourse.name : prereqCode;
                    lockReason = `Missing Prerequisite: ${prereqName}`;
                    break;
                }
            }

            return {
                ...course,
                isLocked,
                lockReason
            };
        }).filter(course => course !== null);

        res.status(200).json({
            success: true,
            data: suggested,
            message: "Available courses fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.registerCourse = async (req, res, next) => {
    try {
        const { universityId, requestedCourses } = req.body;
        
        if (!universityId) {
            const err = new Error('universityId is required');
            err.statusCode = 400; return next(err);
        }
        if (!Array.isArray(requestedCourses)) {
            const err = new Error('requestedCourses must be an array');
            err.statusCode = 400; return next(err);
        }

        const uniqueRequestedCourses = [...new Set(requestedCourses)];

        const newRegisteredCourses = await prisma.$transaction(async (tx) => {
            const student = await tx.student.findUnique({ where: { universityId } });
            if (!student) {
                const err = new Error('Student not found');
                err.statusCode = 404; throw err;
            }

            const courses = await tx.course.findMany();
            
            const academicHistory = (typeof student.academicHistory === 'string') ? JSON.parse(student.academicHistory) : student.academicHistory;
            const passedCodes = (academicHistory || [])
                .filter(h => h.recognition !== 'F' && h.grade >= 50)
                .map(h => h.courseCode);
            const studentLevel = calculateLevel(student.passedHours);
            const maxAllowedHours = getGpaMaxHours(student.gpa, student.year);

            let currentTotalHours = student.registeredCourses.reduce((sum, code) => {
                const c = courses.find(course => course.code === code);
                return sum + (c ? c.creditHours : 0);
            }, 0);

            let newRequestedHours = uniqueRequestedCourses.reduce((sum, code) => {
                const c = courses.find(course => course.code === code);
                if (!c) {
                    const err = new Error(`Course ${code} not found`);
                    err.statusCode = 404; throw err;
                }
                return sum + c.creditHours;
            }, 0);

            if (currentTotalHours + newRequestedHours > maxAllowedHours) {
                const err = new Error(`لا يمكنك تسجيل هذه المادة، لقد تجاوزت الحد الأقصى للساعات المتاحة (${maxAllowedHours} ساعة).`);
                err.statusCode = 400; throw err;
            }

            for (const courseCode of uniqueRequestedCourses) {
                const course = courses.find(c => c.code === courseCode);
                if (!course) {
                    const err = new Error(`Course ${courseCode} not found`);
                    err.statusCode = 404; throw err;
                }
                if (course.status === 'ممتلئ' || course.status === 'ممتلئة' || course.enrolled >= course.capacity) {
                    const err = new Error(`Course ${courseCode} is fully booked.`);
                    err.statusCode = 400; throw err;
                }
                if (passedCodes.includes(courseCode)) {
                    const err = new Error(`Already passed course: ${courseCode}`);
                    err.statusCode = 400; throw err;
                }
                if (student.registeredCourses.includes(courseCode)) {
                    const err = new Error(`Already registered for course: ${courseCode}`);
                    err.statusCode = 400; throw err;
                }
                if (course.level > studentLevel) {
                    const err = new Error(`Registration failed: ${course.name} (${course.code}) requires Level ${course.level}, but you are currently Level ${studentLevel}.`);
                    err.statusCode = 400; throw err;
                }

                const prereqsArray = typeof course.prerequisites === 'string' && course.prerequisites.trim() !== '' 
                    ? course.prerequisites.split(',').map(s => s.trim()) 
                    : (Array.isArray(course.prerequisites) ? course.prerequisites : []);

                for (const prereqCode of prereqsArray) {
                    if (!passedCodes.includes(prereqCode)) {
                        const prereqCourse = courses.find(c => c.code === prereqCode);
                        const prereqName = prereqCourse ? prereqCourse.name : prereqCode;
                        const err = new Error(`Registration failed: ${course.name} (${course.code}) requires prerequisite ${prereqName} (${prereqCode}).`);
                        err.statusCode = 400; err.errorCode = "PREREQUISITE_MISSING";
                        throw err;
                    }
                }
            }

            const updatedRegisteredCourses = [...student.registeredCourses, ...uniqueRequestedCourses];
            
            for (const code of uniqueRequestedCourses) {
                const updatedCourse = await tx.course.update({
                    where: { code },
                    data: { enrolled: { increment: 1 } }
                });
                if (updatedCourse.enrolled >= updatedCourse.capacity && updatedCourse.status !== 'مغلق' && updatedCourse.status !== 'ممتلئ' && updatedCourse.status !== 'ممتلئة') {
                    await tx.course.update({
                        where: { code },
                        data: { status: 'ممتلئ' }
                    });
                }
            }
            
            await tx.student.update({
                where: { universityId },
                data: { registeredCourses: updatedRegisteredCourses }
            });
            
            const logsData = uniqueRequestedCourses.map(code => {
                const course = courses.find(c => c.code === code);
                return {
                    studentId: student.universityId,
                    studentName: student.name,
                    courseCode: code,
                    courseName: course ? course.name : code
                };
            });
            
            if (logsData.length > 0) {
                await tx.adminLog.createMany({ data: logsData });
            }
            
            return updatedRegisteredCourses;
        });

        res.status(200).json({
            success: true,
            data: newRegisteredCourses,
            message: "Courses registered successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.unregisterCourse = async (req, res, next) => {
    try {
        const { universityId, courseCode } = req.body;
        const student = await prisma.student.findUnique({ where: { universityId } });

        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; return next(err);
        }

        const courseIndex = student.registeredCourses.indexOf(courseCode);
        if (courseIndex === -1) {
            const err = new Error('Course is not in your current registration list');
            err.statusCode = 404; return next(err);
        }

        const updatedRegisteredCourses = [...student.registeredCourses];
        updatedRegisteredCourses.splice(courseIndex, 1);

        await prisma.$transaction(async (tx) => {
            await tx.student.update({
                where: { universityId },
                data: { registeredCourses: updatedRegisteredCourses }
            });
            
            const updatedCourse = await tx.course.update({
                where: { code: courseCode },
                data: { enrolled: { decrement: 1 } }
            });
            
            if (updatedCourse.enrolled < updatedCourse.capacity && (updatedCourse.status === 'ممتلئ' || updatedCourse.status === 'ممتلئة')) {
                await tx.course.update({
                    where: { code: courseCode },
                    data: { status: 'متاح' }
                });
            }
        });

        res.status(200).json({ 
            success: true, 
            data: { updatedRegisteredCourses },
            message: 'Course removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.getTimetable = async (req, res, next) => {
    try {
        const { universityId } = req.body;
        const student = await prisma.student.findUnique({ where: { universityId } });

        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; err.errorCode = 'STUDENT_NOT_FOUND';
            return next(err);
        }

        const courses = await prisma.course.findMany();
        const timetable = student.registeredCourses.map((code, index) => {
            const course = courses.find(c => c.code === code);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
            return {
                courseCode: course ? course.code : code,
                courseName: course ? course.name : code,
                day: days[index % days.length],
                time: '10:00 AM - 12:00 PM',
                location: `Lab ${index + 1}`
            };
        });

        res.status(200).json({
            success: true,
            data: timetable,
            message: "Timetable fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const { universityId } = req.body;
        const student = await prisma.student.findUnique({ where: { universityId } });

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
            success: true,
            data: {
                name: student.name,
                email: student.email,
                yearOfStudy: yearMapping[level] || "Unknown",
                department: student.department,
                studentId: student.universityId,
                gpa: student.gpa
            },
            message: "Profile fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.getGrades = async (req, res, next) => {
    try {
        const { universityId } = req.body;
        const student = await prisma.student.findUnique({ where: { universityId } });

        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; return next(err);
        }

        const courses = await prisma.course.findMany();
        
        const academicHistory = (typeof student.academicHistory === 'string') ? JSON.parse(student.academicHistory) : student.academicHistory;
        const historyArray = academicHistory || [];

        const grades = historyArray.map(history => {
            const course = courses.find(c => c.code === history.courseCode);
            return {
                courseName: course ? course.name : history.courseCode,
                semester: history.semester,
                grade: history.grade,
                recognition: history.recognition
            };
        });

        res.status(200).json({
            success: true,
            data: grades,
            message: "Grades fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.getDashboard = async (req, res, next) => {
    try {
        const { universityId } = req.body;
        const student = await prisma.student.findUnique({ where: { universityId } });

        if (!student) {
            const err = new Error('Student not found');
            err.statusCode = 404; return next(err);
        }

        const courses = await prisma.course.findMany();
        
        const maxAllowedHours = getGpaMaxHours(student.gpa, student.year);
        let registeredHours = 0;

        const registeredCoursesDetails = student.registeredCourses.map(code => {
            const course = courses.find(c => c.code === code);
            const hours = course ? course.creditHours : 3;
            registeredHours += hours;
            return {
                code: code,
                courseName: course ? course.name : code,
                hours: hours,
                professor: course ? course.professor : 'TBA',
                action: 'Delete'
            };
        });

        const remainingHours = maxAllowedHours - registeredHours;

        res.status(200).json({
            success: true,
            data: {
                student: {
                    name: student.name,
                    gpa: student.gpa,
                    passedHours: student.passedHours,
                    maxAllowedHours,
                    registeredHours,
                    remainingHours,
                },
                name: student.name,
                gpa: student.gpa,
                availableHours: maxAllowedHours,
                maxAllowedHours,
                registeredHours,
                remainingHours,
                passedHours: student.passedHours,
                registeredCoursesCount: student.registeredCourses.length,
                registeredCoursesDetails
            },
            message: "Dashboard fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};
