const express = require('express');
const router = express.Router();
const { getQRCodeByBatchId, verifyQRCode } = require('../controllers/qr.controller');

router.get('/:batchId', getQRCodeByBatchId);
router.post('/verify', verifyQRCode);

module.exports = router;
