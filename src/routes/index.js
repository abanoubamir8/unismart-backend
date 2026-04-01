const express = require('express');
const router = express.Router();

router.post('/api/login', (req, res) => {
    const { university_id, password } = req.body;

    if (university_id === "2026001" && password === "123") {
        res.status(200).json({
            message: "Login successful",
            student: { id: 1, name: "Muhammad Abdulqader", level: 3, gpa: 3.4 },
            token: "fake-jwt-token"
        });
    } else {
        res.status(401).json({ error: "Invalid university ID or password" });
    }
});

router.get('/api/courses/available', (req, res) => {
    res.status(200).json([
        { id: 1, code: 'CS301', name: 'Software Engineering', credit_hours: 3, prerequisite: 'CS201' },
        { id: 2, code: 'IS302', name: 'Database Systems 2', credit_hours: 3, prerequisite: 'IS202' },
        { id: 3, code: 'IT303', name: 'Computer Networks', credit_hours: 3, prerequisite: 'IT201' }
    ]);
});

router.post('/api/register-course', (req, res) => {
    const { student_id, course_id } = req.body;

    if (course_id === 1 || course_id === 3) {
        res.status(200).json({ message: "Course registered successfully!" });
    } else {
        res.status(400).json({ error: "Registration Blocked: Prerequisite IS202 not completed." });
    }
});

router.get('/api/timetable', (req, res) => {
    res.status(200).json([
        { course: 'Software Engineering', day: 'Monday', time: '10:00 AM - 12:00 PM', room: 'Hall 4' },
        { course: 'Computer Networks', day: 'Wednesday', time: '12:00 PM - 02:00 PM', room: 'Lab 2' }
    ]);
});

module.exports = router;