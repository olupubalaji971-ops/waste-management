const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  name: String,
});

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: [
        'E-Van Bio-Transporter',
        'Heavy Closed Bio-Carrier',
        'Compactor Medical Van',
        'Rapid Response Mini-Carrier',
      ],
      default: 'E-Van Bio-Transporter',
    },
    capacityKg: {
      type: Number,
      required: true,
      default: 800,
    },
    currentLoadKg: {
      type: Number,
      default: 0,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    driverName: {
      type: String,
      default: 'Fleet Operator',
    },
    driverPhone: {
      type: String,
      default: '+91 98480 22338',
    },
    currentLatitude: {
      type: Number,
      required: true,
      default: 17.385,
    },
    currentLongitude: {
      type: Number,
      required: true,
      default: 78.4867,
    },
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'Collecting', 'Maintenance', 'En Route'],
      default: 'Available',
    },
    currentPickupId: {
      type: String,
      default: null,
    },
    assignedDistrict: {
      type: String,
      default: 'Hyderabad',
    },
    routeWaypoints: [waypointSchema],
    lastGpsPing: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
