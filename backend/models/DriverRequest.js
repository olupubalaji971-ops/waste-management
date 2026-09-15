const mongoose = require('mongoose');

const driverRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    driverId: {
      type: String,
      default: 'DRV-TS-0101',
      ref: 'Driver',
    },
    driverName: {
      type: String,
      default: 'Venkatesh Rao',
    },
    driverPhone: {
      type: String,
      default: '9848123456',
    },
    driverPhoto: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: 'TS-09-UB-4501',
    },
    aadhaarLast4: {
      type: String,
      default: 'XXXX',
    },
    licenseLast4: {
      type: String,
      default: 'XXXX',
    },
    hospitalId: {
      type: String,
      required: true,
      ref: 'Hospital',
    },
    hospitalName: {
      type: String,
      required: true,
    },
    batchId: {
      type: String,
      default: '',
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
      default: 25.0,
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
        'PENDING',
        'ACCEPTED',
        'COLLECTED',
        'REJECTED',
      ],
      default: 'REQUESTED',
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
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    acceptedHospitalId: {
      type: String,
      default: '',
    },
    acceptedHospitalName: {
      type: String,
      default: '',
    },
    acceptedBy: {
      type: String,
      default: 'Hospital Superintendent',
    },
    authCode: {
      type: String,
      default: '',
    },
    pickupLocation: {
      type: String,
      default: 'Gate 2 Bio-Waste Yard',
    },
    contactPhone: {
      type: String,
      default: '+91 40 2750 5566',
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
    collectedAt: {
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
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DriverRequest', driverRequestSchema);
