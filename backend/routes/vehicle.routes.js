const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  updateLocation,
} = require('../controllers/vehicle.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getVehicles);
router.post('/', protect, authorize('super_admin'), createVehicle);
router.get('/:id', protect, getVehicleById);
router.put('/:id', protect, authorize('super_admin'), updateVehicle);
router.post('/:id/location', protect, updateLocation);

module.exports = router;
