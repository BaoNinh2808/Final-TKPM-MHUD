const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.login);
router.post('/login', authController.handleLogin);
router.get('/register', authController.register);
router.post('/register', authController.handleRegister);
router.post('/auth/verify', authController.verifyPIN);
router.post('/auth/resend', authController.resendPIN);
router.post('/logout', authController.logout);
router.get('/OTP', authController.renderOTPPage);

module.exports = router;