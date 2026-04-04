const express = require('express');
const router = express.Router();

const {
    mockStudents,
    mockCourses,
    calculateStudentLevel,
    suggestCourses,
    registerForCourses
} = require('../services/registrationService');

router.post('/api/login', (req, res) => {
    const { university_id, password } = req.body;
    const student = mockStudents.find(s => s.student_id === university_id && s.password === password);

    if (student) {
        res.status(200).json({
            message: "Login successful",
            student: { name: student.name, gpa: student.gpa, department: student.department },
            token: "fake-jwt-token"
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Invalid university ID or password",
            errorCode: "INVALID_CREDENTIALS"
        });
    }
});

router.post('/api/courses/available', (req, res) => {
    try {
        const { university_id } = req.body;
        const suggested = suggestCourses(university_id);
        res.status(200).json(suggested);
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message,
            errorCode: error.errorCode || "UNKNOWN_ERROR"
        });
    }
});

router.post('/api/register-course', (req, res) => {
    try {
        const { university_id, requested_courses, semesterType, isGraduating } = req.body;
        const registered = registerForCourses(university_id, requested_courses, semesterType, isGraduating);
        res.status(200).json({ message: "Courses registered successfully!", registered });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message,
            errorCode: error.errorCode || "UNKNOWN_ERROR"
        });
    }
});

router.post('/api/timetable', (req, res) => {
    const { university_id } = req.body;
    const student = mockStudents.find(s => s.student_id === university_id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Student not found",
            errorCode: "STUDENT_NOT_FOUND"
        });
    }

    const timetable = student.registered_courses.map((code, index) => {
        const course = mockCourses.find(c => c.code === code);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        return {
            course_code: course.code,
            course_name: course.name,
            day: days[index % days.length],
            time: '10:00 AM - 12:00 PM',
            location: `Lab ${index + 1}`
        };
    });

    res.status(200).json(timetable);
});

module.exports = router;