const prisma = require('../prisma');
const bcrypt = require('bcrypt');

exports.loginUser = async (req, res, next) => {
    try {
        let { universityId, password } = req.body;

        if (!universityId || !password) {
            const err = new Error("Missing required fields: universityId and password are explicitly required.");
            err.statusCode = 400;
            err.errorCode = "VALIDATION_ERROR";
            return next(err);
        }

        // Prisma expects a string for universityId/username. If frontend sends an integer, Prisma throws a query validation error.
        universityId = String(universityId);

        const admin = await prisma.admin.findUnique({
            where: { username: universityId },
            select: { name: true, password: true }
        });
        
        if (admin) {
            // Check if admin password is plain text (not starting with $2)
            const isAdminPasswordHashed = admin.password.startsWith('$2');
            const isMatch = isAdminPasswordHashed ? await bcrypt.compare(password, admin.password) : admin.password === password;

            if (isMatch) {
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
        }

        const student = await prisma.student.findUnique({
            where: { universityId },
            select: { name: true, password: true, gpa: true, department: true }
        });

        if (student) {
            const isStudentPasswordHashed = student.password.startsWith('$2');
            const isMatch = isStudentPasswordHashed ? await bcrypt.compare(password, student.password) : student.password === password;

            if (isMatch) {
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
        }

        const err = new Error("Invalid university ID or password");
        err.statusCode = 401;
        err.errorCode = "INVALID_CREDENTIALS";
        return next(err);
    } catch (error) {
        console.error("Login Error Details:", error);
        next(error);
    }
};
