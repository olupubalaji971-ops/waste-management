const express = require('express');
const router = express.Router();
const {
  hospitalLogin,
  driverRegister,
  driverLogin,
  facilityLogin,
  getFacilityDashboard,
  regenerateFacilityQR,
  createWasteBatch,
  getHospitalWasteBatches,
  updateWasteBatch,
  getAvailableBatches,
  requestCollection,
  getDriverRequests,
  getHospitalRequests,
  acceptRequest,
  rejectRequest,
  getNotifications,
  markNotificationRead,
  getDisposalFacilities,
  hospitalRequestDriver,
  driverAcceptPickup,
  driverArrivedAtHospital,
  scanQRCode,
  confirmWasteCollected,
  startTransport,
  updateDriverLocation,
  driverArrivedAtDisposalFacility,
  scanDisposalQR,
  confirmWasteDisposed,
  getOrderRouteHistory,
  resetAllData,
  simulateDriverFacilityScan,
} = require('../controllers/api.controller');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/auth/hospital/login', hospitalLogin);
router.post('/auth/driver/register', driverRegister);
router.post('/auth/driver/login', driverLogin);
router.post('/auth/facility/login', facilityLogin);
router.post('/facility/login', facilityLogin);

// Disposal Facility Dashboard & Dynamic QR
router.get('/facility/dashboard', protect, getFacilityDashboard);
router.post('/facility/regenerate-qr', protect, regenerateFacilityQR);
router.post('/facility/simulate-driver-scan', simulateDriverFacilityScan);

// Hospital Waste Batches & Driver Dispatch
router.post('/hospital/waste', protect, createWasteBatch);
router.get('/hospital/waste', protect, getHospitalWasteBatches);
router.put('/hospital/waste/:id', protect, updateWasteBatch);
router.post('/hospital/request-driver/:batchId', protect, hospitalRequestDriver);

// Driver Available Batches & Requests
router.get('/driver/available-batches', protect, getAvailableBatches);
router.post('/driver/request/:batchId', protect, requestCollection);
router.post('/driver/accept-pickup/:requestId', protect, driverAcceptPickup);
router.get('/driver/requests', protect, getDriverRequests);

// Hospital Request Management
router.get('/hospital/requests', protect, getHospitalRequests);
router.put('/hospital/requests/:id/accept', protect, acceptRequest);
router.put('/hospital/requests/:id/reject', protect, rejectRequest);

// Notifications (Scoped per hospital/driver)
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

// Authorized Facilities & Route History
router.get('/facilities', getDisposalFacilities);
router.get('/orders/:orderId/route-history', getOrderRouteHistory);

// ==========================================
// FULL WASTE JOURNEY & CONTINUOUS GPS TRACKING
// ==========================================
// 1. Driver Arrival at Hospital
router.post('/driver/arrived-hospital', protect, driverArrivedAtHospital);

// 2. Hospital QR Scan & Verification (Status -> QR_VERIFIED)
router.post('/driver/scan-qr', protect, scanQRCode);
router.post('/driver/scan-hospital-qr', protect, scanQRCode);

// 3. Confirm Waste Collection (Status -> WASTE_COLLECTED)
router.post('/driver/waste-collected', protect, confirmWasteCollected);

// 4. Start Transport & Tracking (Status -> IN_TRANSIT, Tracking Active)
router.post('/driver/start-transport', protect, startTransport);

// 5. Continuous GPS Telemetry (5-10s interval)
router.post('/driver/location', updateDriverLocation);

// 6. Driver Arrival at Authorized Disposal Facility
router.post('/driver/arrived-facility', protect, driverArrivedAtDisposalFacility);

// 7. Disposal Facility QR Scan & Geofence Validation (Status -> DISPOSAL_QR_VERIFIED)
router.post('/driver/scan-disposal-qr', protect, scanDisposalQR);

// 8. Confirm Final Waste Disposal & Stop Tracking (Status -> COMPLETED)
router.post('/driver/confirm-disposal', protect, confirmWasteDisposed);

// Reset / Refresh Data
router.post('/reset-data', resetAllData);

module.exports = router;
