const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    collectionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    batchId: {
      type: String,
      required: true,
    },
    bookingId: {
      type: String,
      default: '',
    },
    hospitalId: {
      type: String,
      required: true,
    },
    hospitalName: {
      type: String,
      required: true,
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
    vehicleNumber: {
      type: String,
      default: 'TS-09-UB-4501',
    },
    category: {
      type: String,
      required: true,
    },
    wasteType: {
      type: String,
      required: true,
    },
    quantityKg: {
      type: Number,
      required: true,
    },
    pickupLocation: {
      type: String,
      default: 'Biomedical Waste Yard Gate 2',
    },
    collectedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['COLLECTED', 'IN_TRANSIT', 'DELIVERED_TO_FACILITY', 'PROCESSED'],
      default: 'COLLECTED',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Collection', collectionSchema);
