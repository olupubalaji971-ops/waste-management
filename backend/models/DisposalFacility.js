const mongoose = require('mongoose');

const disposalFacilitySchema = new mongoose.Schema(
  {
    facilityId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    facilityName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      default: 'Hyderabad',
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    contactNumber: {
      type: String,
      default: '+91 40 2345 6789',
    },
    facilityType: {
      type: String,
      enum: [
        'Biomedical Waste Treatment Facility',
        'Authorized Incineration Facility',
        'Authorized Waste Processing Facility',
        'Common Bio-Medical Waste Treatment Facility (CBMWTF)',
      ],
      default: 'Common Bio-Medical Waste Treatment Facility (CBMWTF)',
    },
    cpcbRegistrationNumber: {
      type: String,
      default: 'CPCB/TSPCB/BMW/2026/0144',
    },
    qrToken: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DisposalFacility', disposalFacilitySchema);
