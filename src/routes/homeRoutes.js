const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/home', authMiddleware.isAuthenticated, homeController.home);
router.get('/verify', homeController.verify);

module.exports = router;
