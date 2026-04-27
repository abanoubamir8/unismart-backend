const prisma = require('../prisma');
const bcrypt = require('bcrypt');

exports.getStats = async (req, res, next) => {
    try {
        const totalStudents = await prisma.student.count();
        const totalCourses = await prisma.course.count();

        const students = await prisma.student.findMany({
            select: { department: true }
        });

        const coursesAgg = await prisma.course.aggregate({
            _sum: { enrolled: true }
        });
        const activeRegistrations = coursesAgg._sum.enrolled || 0;

        const departmentsCount = new Set(students.map(s => s.department)).size;

        const recentRegistrations = await prisma.adminLog.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalCourses,
                activeRegistrations,
                departmentsCount,
                recentRegistrations
            },
            message: "Admin stats fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.getStudents = async (req, res, next) => {
    try {
        const students = await prisma.student.findMany({
            select: {
                universityId: true,
                name: true,
                email: true,
                gpa: true,
                passedHours: true,
                department: true,
                year: true,
                registeredCourses: true,
                academicHistory: true
            }
        });
        res.status(200).json({
            success: true,
            data: students,
            message: "Students fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.createStudent = async (req, res, next) => {
    try {
        const { studentId, name, password, email, gpa, passedHours, department, year, registeredCourses, academicHistory } = req.body;

        if (!password) {
            const err = new Error("Password is required");
            err.statusCode = 400;
            return next(err);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = await prisma.student.create({
            data: {
                universityId: studentId ? String(studentId) : undefined,
                name: name ? String(name) : undefined,
                password: hashedPassword,
                email: email ? String(email) : null,
                gpa: gpa !== undefined ? parseFloat(gpa) : 0.0,
                passedHours: passedHours !== undefined ? parseInt(passedHours, 10) : 0,
                department: department || "General",
                year: year ? String(year) : "First",
                registeredCourses: Array.isArray(registeredCourses) ? registeredCourses : [],
                academicHistory: academicHistory || []
            },
            select: {
                universityId: true,
                name: true,
                email: true,
                gpa: true,
                passedHours: true,
                department: true,
                year: true,
                registeredCourses: true,
                academicHistory: true
            }
        });

        res.status(201).json({
            success: true,
            data: newStudent,
            message: "Student created successfully"
        });
    } catch (error) {
        console.error("Add Student Error Details:", error);
        if (error.code === 'P2002') {
            const duplicateField = error.meta && error.meta.target ? error.meta.target.join(', ') : 'field';
            const err = new Error(`Student with this ${duplicateField} already exists`);
            err.statusCode = 400;
            err.errorCode = 'DUPLICATE_ENTRY';
            return next(err);
        }
        next(error);
    }
};

exports.updateStudent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const exists = await prisma.student.findUnique({ where: { universityId: id } });
        if (!exists) {
            const err = new Error("Student not found");
            err.statusCode = 404; return next(err);
        }

        const allowedFields = ['name', 'email', 'gpa', 'passedHours', 'department', 'year', 'registeredCourses'];
        const updateData = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) updateData[key] = req.body[key];
        }

        if (req.body.password !== undefined && req.body.password !== null && String(req.body.password).trim() !== '') {
            updateData.password = await bcrypt.hash(String(req.body.password), 10);
        }

        if (req.body.academicHistory) {
            const courses = await prisma.course.findMany();
            const newHistory = req.body.academicHistory.map(record => {
                const numGrade = Number(record.grade);
                if (!isNaN(numGrade) && numGrade >= 0) {
                    if (numGrade >= 90) record.recognition = 'A';
                    else if (numGrade >= 80) record.recognition = 'B';
                    else if (numGrade >= 70) record.recognition = 'C';
                    else if (numGrade >= 60) record.recognition = 'D';
                    else record.recognition = 'F';
                }
                return record;
            });

            const passedCodesBefore = typeof exists.academicHistory === 'string' ? JSON.parse(exists.academicHistory) : (exists.academicHistory || []);
            const allPassed = newHistory.filter(h => h.grade >= 50 && h.recognition !== 'F').map(h => h.courseCode);

            for (const record of newHistory) {
                if (record.grade >= 50 && record.recognition !== 'F') {
                    const course = courses.find(c => c.code === record.courseCode);
                    if (course) {
                        const prereqsArray = typeof course.prerequisites === 'string' && course.prerequisites.trim() !== '' 
                            ? course.prerequisites.split(',').map(s => s.trim()) 
                            : (Array.isArray(course.prerequisites) ? course.prerequisites : []);
                        
                        for (const prereqCode of prereqsArray) {
                            if (!allPassed.includes(prereqCode) && !passedCodesBefore.find(h => h.courseCode === prereqCode && h.grade >= 50 && h.recognition !== 'F')) {
                                const err = new Error('لا يمكن نجاح الطالب في هذا المقرر قبل اجتياز المتطلبات السابقة');
                                err.statusCode = 400;
                                err.success = false;
                                return next(err);
                            }
                        }
                    }
                }
            }
            updateData.academicHistory = newHistory;
        }

        const updatedStudent = await prisma.student.update({
            where: { universityId: id },
            data: updateData,
            select: {
                universityId: true,
                name: true,
                email: true,
                gpa: true,
                passedHours: true,
                department: true,
                year: true,
                registeredCourses: true,
                academicHistory: true
            }
        });

        res.status(200).json({
            success: true,
            data: updatedStudent,
            message: "Student updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteStudent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const exists = await prisma.student.findUnique({ where: { universityId: id } });
        if (!exists) {
            const err = new Error("Student not found");
            err.statusCode = 404; return next(err);
        }

        await prisma.student.delete({ where: { universityId: id } });

        res.status(200).json({
            success: true,
            data: null,
            message: "Student removed"
        });
    } catch (error) {
        next(error);
    }
};

exports.getCourses = async (req, res, next) => {
    try {
        const { level, term } = req.query;
        let whereClause = {};
        if (level) {
            whereClause.level = parseInt(level, 10);
        }
        if (term) {
            whereClause.term = parseInt(term, 10);
        }

        const courses = await prisma.course.findMany({ where: whereClause });
        const students = await prisma.student.findMany({ select: { registeredCourses: true } });

        const coursesWithCapacityInfo = courses.map(c => {
            const currentEnrollment = students.filter(s => s.registeredCourses.includes(c.code)).length;
            return { ...c, currentEnrollment, capacityLabel: `${currentEnrollment}/${c.capacity || 60}` };
        });

        res.status(200).json({
            success: true,
            data: coursesWithCapacityInfo,
            message: "Courses fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.createCourse = async (req, res, next) => {
    try {
        const { code, name, creditHours, level, term, prerequisites, professor, capacity, enrolled, status } = req.body;
        const newCourse = await prisma.course.create({
            data: {
                code: code ? String(code) : undefined,
                name: name ? String(name) : undefined,
                creditHours: creditHours !== undefined ? parseInt(creditHours, 10) : undefined,
                level: level !== undefined ? parseInt(level, 10) : undefined,
                term: term !== undefined ? parseInt(term, 10) : 1,
                prerequisites: prerequisites !== undefined ? String(prerequisites) : "",
                professor: professor ? String(professor) : "TBA",
                capacity: capacity !== undefined ? parseInt(capacity, 10) : 60,
                enrolled: enrolled !== undefined ? parseInt(enrolled, 10) : 0,
                status: status ? String(status) : 'Available'
            }
        });

        res.status(201).json({
            success: true,
            data: newCourse,
            message: "Course created successfully"
        });
    } catch (error) {
        console.error("Add Course Error Details:", error);
        next(error);
    }
};

exports.updateCourse = async (req, res, next) => {
    try {
        const { code } = req.params;
        const exists = await prisma.course.findUnique({ where: { code } });
        if (!exists) {
            const err = new Error("Course not found");
            err.statusCode = 404; return next(err);
        }

        const allowedCourseFields = ['name', 'creditHours', 'level', 'term', 'prerequisites', 'professor', 'capacity', 'enrolled', 'status'];
        const updateCourseData = {};
        for (const key of allowedCourseFields) {
            if (req.body[key] !== undefined) updateCourseData[key] = req.body[key];
        }

        let updatedCourse;

        await prisma.$transaction(async (tx) => {
            if (updateCourseData.status && updateCourseData.status !== exists.status) {
                if (updateCourseData.status === 'مغلق' || updateCourseData.status === 'فارغ') {
                    updateCourseData.enrolled = 0;
                    
                    const affectedStudents = await tx.student.findMany({
                        where: { registeredCourses: { has: code } }
                    });
                    
                    for (const student of affectedStudents) {
                        await tx.student.update({
                            where: { universityId: student.universityId },
                            data: {
                                registeredCourses: student.registeredCourses.filter(c => c !== code)
                            }
                        });
                    }
                } else if (updateCourseData.status === 'ممتلئ' || updateCourseData.status === 'ممتلئة') {
                    updateCourseData.enrolled = updateCourseData.capacity !== undefined ? updateCourseData.capacity : exists.capacity;
                }
            }

            updatedCourse = await tx.course.update({
                where: { code },
                data: updateCourseData
            });
        });

        res.status(200).json({
            success: true,
            data: updatedCourse,
            message: "Course updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const { code } = req.params;
        const exists = await prisma.course.findUnique({ where: { code } });
        if (!exists) {
            const err = new Error("Course not found");
            err.statusCode = 404; return next(err);
        }

        await prisma.course.delete({ where: { code } });

        res.status(200).json({
            success: true,
            data: null,
            message: "Course removed"
        });
    } catch (error) {
        next(error);
    }
};
