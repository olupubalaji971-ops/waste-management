const express = require('express');
const router = express.Router();
const {
  getWasteBatches,
  getWasteBatchById,
  getWasteByQRCode,
  createWasteBatch,
  updateWasteBatch,
  smartSegregate,
} = require('../controllers/waste.controller');
const { protect } = require('../middleware/auth');

router.post('/segregate', smartSegregate);
router.get('/qr/:qrCode', getWasteByQRCode);
router.get('/', protect, getWasteBatches);
router.post('/', protect, createWasteBatch);
router.get('/:id', protect, getWasteBatchById);
router.put('/:id', protect, updateWasteBatch);

module.exports = router;
