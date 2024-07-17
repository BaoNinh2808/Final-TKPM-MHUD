const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.login);
router.post('/auth/login', authController.handleLogin);
router.get('/register', authController.register);
router.post('/auth/register', authController.handleRegister);

module.exports = router;