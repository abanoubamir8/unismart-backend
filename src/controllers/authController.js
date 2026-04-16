const db = require('../models/jsonDatabase');

exports.loginUser = (req, res, next) => {
    try {
        const { universityId, password, role } = req.body;
        
        const admin = db.admins.find(a => a.username === universityId && a.password === password);
        if (admin) {
            if (role !== 'admin') {
                const err = new Error(`Unauthorized: Role mismatch. You are attempting to login as ${role} but this account is a admin.`);
                err.statusCode = 401;
                return next(err);
            }
            return res.status(200).json({
                success: true,
                data: {
                    role: "admin",
                    name: admin.name,
                    token: "fake-admin-jwt-token"
                },
                message: "Admin login successful"
            });
        }

        const student = db.students.find(s => s.studentId === universityId && s.password === password);
        if (student) {
            if (role !== 'student') {
                const err = new Error(`Unauthorized: Role mismatch. You are attempting to login as ${role} but this account is a student.`);
                err.statusCode = 401;
                return next(err);
            }
            return res.status(200).json({
                success: true,
                data: {
                    role: "student",
                    studentData: { name: student.name, gpa: student.gpa, department: student.department },
                    token: "fake-student-jwt-token"
                },
                message: "Student login successful"
            });
        }

        const err = new Error("Invalid university ID or password");
        err.statusCode = 401;
        err.errorCode = "INVALID_CREDENTIALS";
        return next(err);
    } catch (error) {
        next(error);
    }
};
