const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

router.get('/', controller.home);

router.put('/', controller.upload, controller.handleUpload);

module.exports = router;