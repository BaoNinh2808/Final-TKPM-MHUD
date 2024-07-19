const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.login);
router.post('/auth/login', authController.handleLogin);
router.get('/register', authController.register);
router.post('/auth/register', authController.handleRegister);
router.post('/auth/verify', authController.verifyPIN);
router.post('/auth/resend', authController.resendPIN);

module.exports = router;