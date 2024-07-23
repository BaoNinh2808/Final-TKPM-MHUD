const express = require('express');
const router = express.Router();
const controller = require("../controllers/requestFileController");
const authMiddleware = require('../middleware/authMiddleware');
const ensureLoginMiddleware = require('../middleware/ensureLoginMiddleware');

router.get('/', ensureLoginMiddleware, controller.getRequestFile);


module.exports = router;