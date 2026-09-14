const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'Government Hospital',
        'Private Hospital',
        'District Hospital',
        'Area Hospital',
        'Medical College Hospital',
        'Clinic',
        'Nursing Home',
        'Primary Health Centre',
      ],
      default: 'Government Hospital',
    },
    ownership: {
      type: String,
      enum: ['Government', 'Private'],
      default: 'Government',
    },
    registrationNumber: {
      type: String,
      default: '',
    },
    contactPerson: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      default: 'Telangana',
    },
    pincode: {
      type: String,
      default: '500001',
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
      default: 17.385,
    },
    longitude: {
      type: Number,
      required: true,
      default: 78.4867,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending'],
      default: 'Active',
    },
    bedCapacity: {
      type: Number,
      default: 200,
    },
    beds: {
      type: Number,
      default: function () {
        return this.bedCapacity || 200;
      },
    },
    estimatedWaste: {
      type: String,
      default: '50-100 kg/day',
    },
    passwordHash: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
