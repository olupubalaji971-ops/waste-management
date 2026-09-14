const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
  latitude: Number,
  longitude: Number,
  updatedBy: {
    type: String,
    default: 'System',
  },
});

const pickupRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    pickupId: {
      type: String,
      default: function () {
        return this.requestId;
      },
    },
    batchId: {
      type: String,
      required: true,
    },
    wasteBatchIds: [
      {
        type: String,
      },
    ],
    hospitalId: {
      type: String,
      required: true,
      ref: 'Hospital',
    },
    hospitalName: {
      type: String,
      default: '',
    },
    driverId: {
      type: String,
      default: null,
      ref: 'Driver',
    },
    driverName: {
      type: String,
      default: null,
    },
    driverPhone: {
      type: String,
      default: null,
    },
    driverPhoto: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: 'TS-09-UB-4501',
    },
    wasteCategory: {
      type: String,
      default: 'YELLOW',
    },
    wasteType: {
      type: String,
      default: 'Infectious Waste',
    },
    wasteQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    pickupAddress: {
      type: String,
      default: 'Gate 2 Bio-Waste Yard',
    },
    status: {
      type: String,
      enum: [
        'CREATED',
        'REQUESTED',
        'DRIVER_ACCEPTED',
        'TRAVELLING_TO_HOSPITAL',
        'ARRIVED_AT_HOSPITAL',
        'QR_VERIFIED',
        'WASTE_COLLECTED',
        'IN_TRANSIT',
        'ARRIVED_AT_DISPOSAL_FACILITY',
        'DISPOSAL_QR_VERIFIED',
        'WASTE_DISPOSED',
        'COMPLETED',
        // Backwards compatibility legacy aliases
        'PENDING',
        'ACCEPTED',
        'COLLECTED',
        'REJECTED',
      ],
      default: 'CREATED',
    },
    distanceAtRequest: {
      type: Number,
      default: 0,
    },
    trackingActive: {
      type: Boolean,
      default: false,
    },
    currentLatitude: {
      type: Number,
      default: null,
    },
    currentLongitude: {
      type: Number,
      default: null,
    },
    gpsAccuracy: {
      type: Number,
      default: null,
    },
    lastGpsUpdate: {
      type: Date,
      default: null,
    },
    // Timestamps
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    hospitalArrivedAt: {
      type: Date,
      default: null,
    },
    qrVerifiedAt: {
      type: Date,
      default: null,
    },
    wasteCollectedAt: {
      type: Date,
      default: null,
    },
    trackingStartedAt: {
      type: Date,
      default: null,
    },
    // Disposal Facility Fields
    disposalFacilityId: {
      type: String,
      default: null,
    },
    disposalFacilityName: {
      type: String,
      default: null,
    },
    disposalFacilityArrivalAt: {
      type: Date,
      default: null,
    },
    disposalQrVerifiedAt: {
      type: Date,
      default: null,
    },
    disposedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    finalLatitude: {
      type: Number,
      default: null,
    },
    finalLongitude: {
      type: Number,
      default: null,
    },
    scanId: {
      type: String,
      default: null,
    },
    collectionId: {
      type: String,
      default: null,
    },
    timeline: [timelineItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
