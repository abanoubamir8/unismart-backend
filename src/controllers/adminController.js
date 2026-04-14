const db = require('../models/jsonDatabase');

exports.getStats = (req, res, next) => {
    try {
        const totalStudents = db.students.length;
        const totalCourses = db.courses.length;
        const activeRegistrations = db.students.reduce((sum, s) => sum + s.registeredCourses.length, 0);
        const departmentsCount = new Set(db.students.map(s => s.department)).size;

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalCourses,
                activeRegistrations,
                departmentsCount,
                recentRegistrations: db.logs.slice(0, 5)
            },
            message: "Admin stats fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.getStudents = (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: db.students,
            message: "Students fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.createStudent = (req, res, next) => {
    try {
        const exists = db.students.find(s => s.studentId === req.body.studentId);
        if (exists) {
            const err = new Error("Student ID already exists");
            err.statusCode = 400; err.errorCode = "DUPLICATE_ID";
            return next(err);
        }

        const newStudent = { ...req.body, registeredCourses: req.body.registeredCourses || [], academicHistory: req.body.academicHistory || [] };
        db.students.push(newStudent);
        db.saveToDisk();
        res.status(201).json({
            success: true,
            data: newStudent,
            message: "Student created successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.updateStudent = (req, res, next) => {
    try {
        const studentIndex = db.students.findIndex(s => s.studentId === req.params.id);
        if (studentIndex === -1) {
            const err = new Error("Student not found");
            err.statusCode = 404; return next(err);
        }
        db.students[studentIndex] = { ...db.students[studentIndex], ...req.body };
        db.saveToDisk();
        res.status(200).json({
            success: true,
            data: db.students[studentIndex],
            message: "Student updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteStudent = (req, res, next) => {
    try {
        const studentIndex = db.students.findIndex(s => s.studentId === req.params.id);
        if (studentIndex === -1) {
            const err = new Error("Student not found");
            err.statusCode = 404; return next(err);
        }
        db.students.splice(studentIndex, 1);
        db.saveToDisk();
        res.status(200).json({
            success: true,
            data: null,
            message: "Student removed"
        });
    } catch (error) {
        next(error);
    }
};

exports.getCourses = (req, res, next) => {
    try {
        const coursesWithCapacityInfo = db.courses.map(c => {
            const currentEnrollment = db.students.filter(s => s.registeredCourses.includes(c.code)).length;
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

exports.createCourse = (req, res, next) => {
    try {
        const newCourse = { capacity: 60, status: 'Available', prerequisites: [], ...req.body };
        db.courses.push(newCourse);
        db.saveToDisk();
        res.status(201).json({
            success: true,
            data: newCourse,
            message: "Course created successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.updateCourse = (req, res, next) => {
    try {
        const courseIndex = db.courses.findIndex(c => c.code === req.params.code);
        if (courseIndex === -1) {
            const err = new Error("Course not found");
            err.statusCode = 404; return next(err);
        }
        db.courses[courseIndex] = { ...db.courses[courseIndex], ...req.body };
        db.saveToDisk();
        res.status(200).json({
            success: true,
            data: db.courses[courseIndex],
            message: "Course updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteCourse = (req, res, next) => {
    try {
        const courseIndex = db.courses.findIndex(c => c.code === req.params.code);
        if (courseIndex === -1) {
            const err = new Error("Course not found");
            err.statusCode = 404; return next(err);
        }
        db.courses.splice(courseIndex, 1);
        db.saveToDisk();
        res.status(200).json({
            success: true,
            data: null,
            message: "Course removed"
        });
    } catch (error) {
        next(error);
    }
};
