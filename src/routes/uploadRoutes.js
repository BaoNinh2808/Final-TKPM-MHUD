const express = require('express');
const router = express.Router();
const controller = require('../controllers/uploadController');

router.put('/', controller.upload, controller.handleUpload);

module.exports = router;