const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    batchId: {
      type: String,
      required: true,
      index: true,
    },
    driverId: {
      type: String,
      required: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      default: 5,
    },
    speed: {
      type: Number,
      default: 35,
    },
    heading: {
      type: Number,
      default: 0,
    },
    distanceFromHospitalKm: {
      type: Number,
      default: 0,
    },
    distanceToFacilityKm: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tracking', trackingSchema);
