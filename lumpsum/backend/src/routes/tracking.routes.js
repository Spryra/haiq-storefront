const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/tracking.controller');

router.get('/:token', trackingController.getTracking);
router.get('/:token/stream', trackingController.streamStatus); // SSE

module.exports = router;
