const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.delete('/api/unregister-course', courseController.dropCourse);

module.exports = router;
