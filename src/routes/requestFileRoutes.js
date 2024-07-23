// route to requestFilePage
const express = require('express');
const router = express.Router();
const controller = require("../controllers/requestFileController");
const authMiddleware = require("../middleware/authMiddleware");

router.get('/', controller.getRequestFilePage);

module.exports = router;