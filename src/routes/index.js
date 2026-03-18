const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const registrationController = require('../controllers/registrationController');
const courseController = require('../controllers/courseController');
const studentController = require('../controllers/studentController');
const staffController = require('../controllers/staffController');
const { protect, authorize } = require('../util/authMiddleware');

router.post('/auth/login', authController.login);
router.get('/courses/available', protect, authorize('student'), courseController.getAvailable);
router.post('/registration/enroll', protect, authorize('student'), registrationController.enroll);
router.get('/student/profile', protect, authorize('student'), studentController.getProfile);
router.get('/staff/students', protect, authorize('staff', 'admin'), staffController.getStudents);

module.exports = router;
