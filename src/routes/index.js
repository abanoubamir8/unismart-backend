const express = require('express');
const router = express.Router();

const {
    mockStudents,
    mockCourses,
    calculateStudentLevel,
    suggestCourses,
    registerForCourses
} = require('./registrationService');

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
        res.status(401).json({ error: "Invalid university ID or password" });
    }
});

router.post('/api/courses/available', (req, res) => {
    try {
        const { university_id } = req.body;
        const suggested = suggestCourses(university_id);
        res.status(200).json(suggested);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/api/register-course', (req, res) => {
    try {
        const { university_id, requested_courses, semesterType, isGraduating } = req.body;
        const registered = registerForCourses(university_id, requested_courses, semesterType, isGraduating);
        res.status(200).json({ message: "Courses registered successfully!", registered });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/api/timetable', (req, res) => {
    const { university_id } = req.body;
    const student = mockStudents.find(s => s.student_id === university_id);

    if (!student) return res.status(404).json({ error: "Student not found" });

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