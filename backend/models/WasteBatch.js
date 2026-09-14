const mongoose = require('mongoose');
const crypto = require('crypto');

const wasteBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hospitalId: {
      type: String,
      required: true,
      ref: 'Hospital',
    },
    hospitalName: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['YELLOW', 'RED', 'WHITE', 'BLUE', 'GENERAL', 'Yellow', 'Red', 'White', 'Blue', 'General'],
      required: true,
    },
    wasteType: {
      type: String,
      required: true,
    },
    quantityKg: {
      type: Number,
      default: function () {
        return this.quantity || 0;
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.1,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    time: {
      type: String,
      default: () => new Date().toLocaleTimeString('en-US', { hour12: false }),
    },
    collectionDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    collectionTime: {
      type: String,
      default: () => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    },
    pickupLocation: {
      type: String,
      default: 'Biomedical Waste Yard Gate 2',
    },
    contactPerson: {
      type: String,
      default: 'Hospital In-Charge',
    },
    pickupPhone: {
      type: String,
      default: '+91 40 2750 5566',
    },
    pickupInstructions: {
      type: String,
      default: 'Autoclave sealed biohazard packaging. Handle with PPE.',
    },
    notes: {
      type: String,
      default: '',
    },
    qrVersion: {
      type: Number,
      default: 1,
    },
    qrToken: {
      type: String,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    qrCodeData: {
      type: String,
      default: '',
    },
    assignedDriverId: {
      type: String,
      default: null,
    },
    assignedDriverName: {
      type: String,
      default: null,
    },
    assignedDriverPhone: {
      type: String,
      default: null,
    },
    vehicleNumber: {
      type: String,
      default: null,
    },
    disposalFacilityId: {
      type: String,
      default: null,
    },
    disposalFacilityName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'ACTIVE',
        'GENERATED',
        'CREATED',
        'PENDING',
        'REQUESTED',
        'ACCEPTED',
        'DRIVER_ACCEPTED',
        'TRAVELLING_TO_HOSPITAL',
        'ARRIVED_AT_HOSPITAL',
        'QR_VERIFIED',
        'WASTE_COLLECTED',
        'COLLECTED',
        'IN_TRANSIT',
        'ARRIVED_AT_DISPOSAL_FACILITY',
        'DISPOSAL_QR_VERIFIED',
        'WASTE_DISPOSED',
        'COMPLETED',
        'PROCESSED',
      ],
      default: 'ACTIVE',
    },
    treatmentMethod: {
      type: String,
      default: 'Autoclaving & Shredding / Incineration',
    },
    createdBy: {
      type: String,
      default: 'Hospital Staff',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WasteBatch', wasteBatchSchema);
