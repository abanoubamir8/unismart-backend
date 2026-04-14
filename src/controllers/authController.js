const db = require('../models/jsonDatabase');

exports.loginUser = (req, res, next) => {
    try {
        const { universityId, password } = req.body;
        
        const admin = db.admins.find(a => a.username === universityId && a.password === password);
        if (admin) {
            return res.status(200).json({
                success: true,
                role: "admin",
                name: admin.name,
                token: "fake-admin-jwt-token"
            });
        }

        const student = db.students.find(s => s.studentId === universityId && s.password === password);
        if (student) {
            return res.status(200).json({
                success: true,
                role: "student",
                message: "Login successful",
                studentData: { name: student.name, gpa: student.gpa, department: student.department },
                token: "fake-student-jwt-token"
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
