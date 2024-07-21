const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://ip-api.com/json/');
        res.json({
            ip: response.data.query,
            lat: response.data.lat,
            lon: response.data.lon
        });
    } catch (error) {
        console.error('Error fetching public IP:', error);
        res.status(500).json({ error: 'Failed to fetch public IP' });
    }
});

module.exports = router;
