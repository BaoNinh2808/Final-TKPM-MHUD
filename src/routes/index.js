const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const homeRoutes = require('./homeRoutes');

router.use('/', authRoutes);
router.use('/', homeRoutes);

module.exports = router;