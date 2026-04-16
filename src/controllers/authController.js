const prisma = require('../prisma');

exports.loginUser = async (req, res, next) => {
    try {
        const { universityId, password, role } = req.body;

        const admin = await prisma.admin.findUnique({
            where: { username: universityId }
        });
        
        if (admin && admin.password === password) {
            if (role !== 'admin') {
                const err = new Error(`Unauthorized: Role mismatch. You are attempting to login as ${role} but this account is a admin.`);
                err.statusCode = 403;
                err.errorCode = 'FORBIDDEN';
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

        const student = await prisma.student.findUnique({
            where: { universityId }
        });

        if (student && student.password === password) {
            if (role !== 'student') {
                const err = new Error(`Unauthorized: Role mismatch. You are attempting to login as ${role} but this account is a student.`);
                err.statusCode = 403;
                err.errorCode = 'FORBIDDEN';
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
