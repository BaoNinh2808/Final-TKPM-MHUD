const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.login);
router.post('/auth/login', authController.handleLogin);
router.get('/register', authController.register);

module.exports = router;