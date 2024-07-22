//handle call to public page
const express = require('express');
const router = express.Router();
const controller = require("../controllers/publicController");
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', controller.getPublicPage);

module.exports = router;