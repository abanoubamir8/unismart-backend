const express = require('express');
const authRoutes = require('./authRoutes');
const registrationRoutes = require('./registrationRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/registration', registrationRoutes);

module.exports = router;
