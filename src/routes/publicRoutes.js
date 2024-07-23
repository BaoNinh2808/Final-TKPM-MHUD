//handle call to public page
const express = require('express');
const router = express.Router();
const controller = require("../controllers/publicController");
const authMiddleware = require('../middleware/authMiddleware');
const ensureLoginMiddleware = require('../middleware/ensureLoginMiddleware');

router.get('/', ensureLoginMiddleware, controller.getPublicPage);

module.exports = router;