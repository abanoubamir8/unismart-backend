const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.post('/api/unregister-course', courseController.dropCourse);

module.exports = router;
