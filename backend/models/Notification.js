const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    recipientRole: {
      type: String,
      default: 'HOSPITAL',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    requestId: {
      type: String,
      default: null,
    },
    batchId: {
      type: String,
      default: null,
    },
    driverName: {
      type: String,
      default: '',
    },
    driverPhone: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'INFO',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
