const express = require('express');
const router = express.Router();
const {
  getDriverHospitals,
  createDriverBooking,
  getDriverBookings,
  scanQRCodeAndCollect,
} = require('../controllers/driver.controller');
const { protect } = require('../middleware/auth');

router.get('/hospitals', protect, getDriverHospitals);
router.post('/bookings', protect, createDriverBooking);
router.get('/bookings', protect, getDriverBookings);
router.post('/scan-qr', protect, scanQRCodeAndCollect);

module.exports = router;
