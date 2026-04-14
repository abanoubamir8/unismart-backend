const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/courses/available', studentController.getAvailableCourses);
router.post('/register-course', studentController.registerCourse);
router.post('/unregister-course', studentController.unregisterCourse);
router.post('/timetable', studentController.getTimetable);
router.post('/profile', studentController.getProfile);
router.post('/grades', studentController.getGrades);
router.post('/dashboard', studentController.getDashboard);

module.exports = router;
