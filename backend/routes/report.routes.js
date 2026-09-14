const express = require('express');
const router = express.Router();
const {
  getSummaryMetrics,
  getDistrictAnalytics,
  getTrends,
  exportReportCSV,
  getGoogleSheetsData,
} = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getSummaryMetrics);
router.get('/district', protect, getDistrictAnalytics);
router.get('/trends', protect, getTrends);
router.get('/export-csv', protect, exportReportCSV);
router.get('/google-sheets', getGoogleSheetsData);

module.exports = router;
