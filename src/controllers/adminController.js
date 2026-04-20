const prisma = require('../prisma');
const bcrypt = require('bcrypt');

exports.getStats = async (req, res, next) => {
    try {
        const totalStudents = await prisma.student.count();
        const totalCourses = await prisma.course.count();
        
        const students = await prisma.student.findMany({
            select: { registeredCourses: true, department: true }
        });
        
        const activeRegistrations = students.reduce((sum, s) => sum + s.registeredCourses.length, 0);
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

        const allowedFields = ['name', 'email', 'password', 'gpa', 'passedHours', 'department', 'year', 'registeredCourses', 'academicHistory'];
        const updateData = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) updateData[key] = req.body[key];
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
        const courses = await prisma.course.findMany();
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
        const { code, name, creditHours, level, prerequisites, professor, capacity, enrolled, status } = req.body;
        const newCourse = await prisma.course.create({
            data: { 
                code: code ? String(code) : undefined,
                name: name ? String(name) : undefined,
                creditHours: creditHours !== undefined ? parseInt(creditHours, 10) : undefined,
                level: level !== undefined ? parseInt(level, 10) : undefined,
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

        const allowedCourseFields = ['name', 'creditHours', 'level', 'prerequisites', 'professor', 'capacity', 'enrolled', 'status'];
        const updateCourseData = {};
        for (const key of allowedCourseFields) {
            if (req.body[key] !== undefined) updateCourseData[key] = req.body[key];
        }

        const updatedCourse = await prisma.course.update({
            where: { code },
            data: updateCourseData
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
