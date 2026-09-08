const express = require('express');
const router = express.Router();
const { saveAd, getAd } = require('../controllers/ad');
const { authenticate } = require('../middleware/auth');

router.post('/save', authenticate, saveAd);
router.get('/get', getAd);

module.exports = router;
