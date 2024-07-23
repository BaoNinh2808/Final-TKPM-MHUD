const express = require('express');
const router = express.Router();
const controller = require("../controllers/homeController");
const authMiddleware = require('../middleware/authMiddleware');
const ensureLoginMiddleware = require('../middleware/ensureLoginMiddleware');

// const homeController = require('../controllers/homeController');
// const authMiddleware = require('../middleware/authMiddleware');

// router.get('/home', authMiddleware.isAuthenticated, homeController.home);
// router.get('/verify', homeController.verify);

router.get('/', ensureLoginMiddleware, controller.getHomePage);
// router.put('/', authMiddleware, controller.upload, controller.handleUpload);
router.put('/', authMiddleware, controller.upload, controller.handleUpload);
router.delete('/', authMiddleware, controller.deleteFile);
router.post('/getFileInfo', authMiddleware, controller.getFileInfo);
router.post('/getServerRandom',  authMiddleware, controller.getServerRandom);
router.get('/mimeTypes',  authMiddleware, controller.getMimeTypes);

module.exports = router;
