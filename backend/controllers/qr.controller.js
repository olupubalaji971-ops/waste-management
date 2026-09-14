const { WasteBatch, Hospital } = require('../models');

// @desc    Get dynamic QR code payload & token for batch
// @route   GET /api/qr/:batchId
// @access  Public / Protected
exports.getQRCodeByBatchId = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await WasteBatch.findOne({
      $or: [{ batchId }, { qrCodeData: { $regex: batchId, $options: 'i' } }],
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Waste batch not found' });
    }

    const hospital = await Hospital.findOne({ hospitalId: batch.hospitalId });

    return res.status(200).json({
      success: true,
      data: {
        batchId: batch.batchId,
        hospitalId: batch.hospitalId,
        hospitalName: hospital?.name || batch.hospitalName || batch.hospitalId,
        category: batch.category,
        wasteType: batch.wasteType,
        quantityKg: batch.quantity || batch.quantityKg,
        date: batch.date || batch.collectionDate,
        time: batch.time || batch.collectionTime,
        pickupLocation: batch.pickupLocation,
        status: batch.status,
        version: batch.qrVersion || 1,
        token: batch.qrToken,
        qrCodePayload: {
          batchId: batch.batchId,
          version: batch.qrVersion || 1,
          token: batch.qrToken,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving QR code' });
  }
};

// @desc    Verify QR token & version
// @route   POST /api/qr/verify
// @access  Public / Protected
exports.verifyQRCode = async (req, res) => {
  try {
    const { batchId, token, version } = req.body;

    if (!batchId) {
      return res.status(400).json({ success: false, message: 'Batch ID is required' });
    }

    const batch = await WasteBatch.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found', valid: false });
    }

    const isTokenValid = !token || token === batch.qrToken;
    const isVersionCurrent = !version || parseInt(version) === batch.qrVersion;

    if (!isTokenValid || !isVersionCurrent) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'QR Code is expired or has been refreshed by the hospital.',
        currentVersion: batch.qrVersion,
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: 'QR Code is active and valid.',
      data: batch,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Verification error' });
  }
};
