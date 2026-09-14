const express = require('express');
const router = express.Router();
const {
  getHospitals,
  getHospitalById,
  getHospitalDashboard,
  createHospitalWasteBatch,
  updateHospitalWasteBatch,
  getHospitalDriverRequests,
  acceptDriverRequest,
  rejectDriverRequest,
} = require('../controllers/hospital.controller');
const { protect } = require('../middleware/auth');

router.get('/', getHospitals);
router.get('/dashboard', protect, getHospitalDashboard);
router.get('/driver-requests', protect, getHospitalDriverRequests);
router.put('/driver-requests/:id/accept', protect, acceptDriverRequest);
router.put('/driver-requests/:id/reject', protect, rejectDriverRequest);
router.post('/waste-batches', protect, createHospitalWasteBatch);
router.put('/waste-batches/:id', protect, updateHospitalWasteBatch);
router.get('/:id', getHospitalById);

module.exports = router;
