const express = require('express');
const registrationController = require('../controllers/registrationController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/suggestions', registrationController.getSuggestions);
router.post('/', registrationController.register);

module.exports = router;
