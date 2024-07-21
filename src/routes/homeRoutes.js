const express = require('express');
const router = express.Router();
const controller = require("../controllers/homeController");
const authMiddleware = require('../middleware/authMiddleware');

// const homeController = require('../controllers/homeController');
// const authMiddleware = require('../middleware/authMiddleware');

// router.get('/home', authMiddleware.isAuthenticated, homeController.home);
// router.get('/verify', homeController.verify);

router.get('/', controller.getHomePage);
router.put('/', authMiddleware,controller.upload, controller.handleUpload);
router.delete('/', controller.deleteFile);

module.exports = router;
