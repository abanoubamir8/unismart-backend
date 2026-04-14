const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/stats', adminController.getStats);

router.get('/students', adminController.getStudents);
router.post('/students/list', adminController.getStudents);
router.post('/students', adminController.createStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.put('/students/:id/delete', adminController.deleteStudent);

router.get('/courses', adminController.getCourses);
router.post('/courses/list', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:code', adminController.updateCourse);
router.delete('/courses/:code', adminController.deleteCourse);
router.put('/courses/:code/delete', adminController.deleteCourse);

module.exports = router;
