const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    driverId: {
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
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    aadhaarEncrypted: {
      type: String,
      default: '',
    },
    aadhaarLast4: {
      type: String,
      required: true,
    },
    licenseNumberEncrypted: {
      type: String,
      default: '',
    },
    licenseLast4: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    licensePhotoUrl: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: 'TS-09-UB-4501',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ON_DUTY', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
