const express = require('express');
const router = express.Router();
const controller = require("../controllers/requestFileController");
const authMiddleware = require('../middleware/authMiddleware');
const ensureLoginMiddleware = require('../middleware/ensureLoginMiddleware');

router.get('/', ensureLoginMiddleware, controller.getRequestFile);
router.post('/', authMiddleware, controller.sendRequestFile);
router.get('/upload', controller.getAnonymousUpload);
router.post('/upload', controller.upload, controller.postAnonymousUpload);
module.exports = router;