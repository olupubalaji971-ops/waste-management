const express = require('express');
const router = express.Router();
const {
  getPickups,
  getPickupById,
  createPickupRequest,
  assignPickup,
  updatePickupStatus,
} = require('../controllers/pickup.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getPickups);
router.post('/', protect, createPickupRequest);
router.get('/:id', protect, getPickupById);
router.post('/:id/assign', protect, authorize('super_admin'), assignPickup);
router.put('/:id/status', protect, updatePickupStatus);

module.exports = router;
