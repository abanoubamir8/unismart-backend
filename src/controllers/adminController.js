const prisma = require('../prisma');

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
        const students = await prisma.student.findMany();
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
        const { studentId, ...data } = req.body;
        const exists = await prisma.student.findUnique({ where: { universityId: studentId } });
        if (exists) {
            const err = new Error("Student ID already exists");
            err.statusCode = 400; err.errorCode = "DUPLICATE_ID";
            return next(err);
        }

        const newStudent = await prisma.student.create({
            data: { 
                universityId: studentId,
                ...data,
                registeredCourses: req.body.registeredCourses || [],
                academicHistory: req.body.academicHistory || []
            }
        });
        
        res.status(201).json({
            success: true,
            data: newStudent,
            message: "Student created successfully"
        });
    } catch (error) {
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

        // if the body passed academicHistory array, Prisma will handle it as Json mapping
        const updatedStudent = await prisma.student.update({
            where: { universityId: id },
            data: req.body
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
        const newCourse = await prisma.course.create({
            data: { 
                capacity: 60, 
                status: 'Available', 
                prerequisites: [], 
                ...req.body 
            }
        });
        
        res.status(201).json({
            success: true,
            data: newCourse,
            message: "Course created successfully"
        });
    } catch (error) {
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

        const updatedCourse = await prisma.course.update({
            where: { code },
            data: req.body
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
