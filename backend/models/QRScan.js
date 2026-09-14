const mongoose = require('mongoose');

const qrScanSchema = new mongoose.Schema(
  {
    scanId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    driverId: {
      type: String,
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    driverPhone: {
      type: String,
      required: true,
    },
    hospitalId: {
      type: String,
      required: true,
    },
    hospitalName: {
      type: String,
      required: true,
    },
    batchId: {
      type: String,
      required: true,
    },
    bookingId: {
      type: String,
      default: '',
    },
    wasteQuantity: {
      type: Number,
      required: true,
    },
    wasteType: {
      type: String,
      default: '',
    },
    wasteCategory: {
      type: String,
      default: 'YELLOW',
    },
    qrVersion: {
      type: Number,
      default: 1,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'INVALID_TOKEN', 'UNAUTHORIZED_DRIVER', 'EXPIRED_VERSION'],
      default: 'SUCCESS',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QRScan', qrScanSchema);
