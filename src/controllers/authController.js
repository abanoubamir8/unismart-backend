const prisma = require('../prisma');

exports.loginUser = async (req, res, next) => {
    try {
        const { universityId, password } = req.body;

        if (!universityId || !password) {
            const err = new Error("Missing required fields: universityId and password are explicitly required.");
            err.statusCode = 400;
            err.errorCode = "VALIDATION_ERROR";
            return next(err);
        }

        const admin = await prisma.admin.findUnique({
            where: { username: universityId },
            select: { name: true, password: true }
        });
        
        if (admin && admin.password === password) {
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
            where: { universityId },
            select: { name: true, password: true, gpa: true, department: true }
        });

        if (student && student.password === password) {
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
