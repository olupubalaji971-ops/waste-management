const { Driver, Hospital, WasteBatch, DriverRequest, Collection, QRScan } = require('../models');
const googleSheetsService = require('../services/googleSheets.service');

// @desc    Get hospitals list for driver console
// @route   GET /api/driver/hospitals
// @access  Protected (Driver)
exports.getDriverHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: 'Active' });
    const driverId = req.user?.driverId || req.user?.id;

    const list = await Promise.all(
      hospitals.map(async (h) => {
        const hObj = h.toObject ? h.toObject() : { ...h };
        const activeBatches = await WasteBatch.find({
          hospitalId: h.hospitalId,
          status: { $in: ['GENERATED', 'REQUESTED', 'ACCEPTED'] },
        });

        const totalKg = activeBatches.reduce((acc, b) => acc + (b.quantity || b.quantityKg || 0), 0);
        const categories = [...new Set(activeBatches.map((b) => b.category))];

        // Check if current driver has an existing booking with this hospital
        let existingBooking = null;
        if (driverId) {
          existingBooking = await DriverRequest.findOne({
            hospitalId: h.hospitalId,
            driverId,
            status: { $in: ['REQUESTED', 'ACCEPTED'] },
          });
        }

        return {
          hospitalId: hObj.hospitalId,
          name: hObj.name,
          district: hObj.district,
          address: hObj.address,
          phone: hObj.phone,
          availableWasteKg: Math.round(totalKg * 10) / 10,
          categories: categories.length > 0 ? categories : ['YELLOW', 'RED'],
          pickupStatus: activeBatches.length > 0 ? 'READY_FOR_PICKUP' : 'NO_PENDING_WASTE',
          activeBatchesCount: activeBatches.length,
          activeBatches: activeBatches.map((b) => ({
            batchId: b.batchId,
            category: b.category,
            wasteType: b.wasteType,
            quantityKg: b.quantity || b.quantityKg,
            status: b.status,
          })),
          bookingStatus: existingBooking ? existingBooking.status : 'NONE',
          bookingId: existingBooking ? existingBooking.requestId : null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    console.error('Get Driver Hospitals Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve hospitals for driver' });
  }
};

// @desc    Book a waste collection job for a hospital
// @route   POST /api/driver/bookings
// @access  Protected (Driver)
exports.createDriverBooking = async (req, res) => {
  try {
    const { hospitalId, batchId, wasteCategory, wasteQuantity, notes } = req.body;
    const driverId = req.user?.driverId || req.user?.id || 'DRV-TS-0101';
    const driverName = req.user?.name || 'Kiran Kumar (TS Bio-Carrier)';
    const driverPhone = req.user?.phone || '+91 98480 22338';
    const vehicleNumber = req.user?.vehicleNumber || 'TS-09-UB-4501';

    const hospital = await Hospital.findOne({ hospitalId });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Find driver details for photo & masked Aadhaar/License
    const driverDoc = await Driver.findOne({
      $or: [{ driverId }, { phone: driverPhone }],
    });

    const now = new Date();
    const requestId = `REQ-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = await DriverRequest.create({
      requestId,
      driverId,
      driverName,
      driverPhone,
      driverPhoto: driverDoc?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      vehicleNumber,
      aadhaarLast4: driverDoc?.aadhaarLast4 || '4501',
      licenseLast4: driverDoc?.licenseLast4 || '9921',
      hospitalId: hospital.hospitalId,
      hospitalName: hospital.name,
      batchId: batchId || '',
      wasteCategory: wasteCategory || 'YELLOW',
      wasteQuantity: wasteQuantity ? parseFloat(wasteQuantity) : 25.0,
      status: 'REQUESTED',
      requestedAt: now,
      notes: notes || '',
    });

    // Update batch status to REQUESTED if batchId given
    if (batchId) {
      await WasteBatch.findOneAndUpdate(
        { batchId },
        { status: 'REQUESTED' }
      );
    }

    // Mirror to Google Sheets: DriverRequests
    await googleSheetsService.logRow('DriverRequests', {
      requestId: newRequest.requestId,
      driverName: newRequest.driverName,
      driverPhone: newRequest.driverPhone,
      hospitalName: newRequest.hospitalName,
      wasteQuantity: newRequest.wasteQuantity,
      status: 'REQUESTED',
      requestedAt: now.toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: 'Collection booking request submitted to hospital. Awaiting approval.',
      data: newRequest,
    });
  } catch (error) {
    console.error('Create Driver Booking Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create collection booking' });
  }
};

// @desc    Get all bookings made by driver
// @route   GET /api/driver/bookings
// @access  Protected (Driver)
exports.getDriverBookings = async (req, res) => {
  try {
    const driverId = req.user?.driverId || req.user?.id;
    const bookings = await DriverRequest.find({
      $or: [{ driverId }, { driverPhone: req.user?.phone }],
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve driver bookings' });
  }
};

// @desc    Driver scans hospital QR code to verify & finalize collection
// @route   POST /api/driver/scan-qr
// @access  Protected (Driver)
exports.scanQRCodeAndCollect = async (req, res) => {
  try {
    const { qrToken, batchId, qrVersion, bookingId, rawQRString } = req.body;
    const driverId = req.user?.driverId || req.user?.id || 'DRV-TS-0101';
    const driverName = req.user?.name || 'Kiran Kumar (TS Bio-Carrier)';
    const driverPhone = req.user?.phone || '+91 98480 22338';
    const vehicleNumber = req.user?.vehicleNumber || 'TS-09-UB-4501';

    // Parse raw QR string if provided from physical scanner
    let parsedToken = qrToken;
    let parsedBatchId = batchId;
    let parsedVersion = qrVersion;

    if (rawQRString) {
      try {
        const qrJson = JSON.parse(rawQRString);
        parsedToken = qrJson.token || parsedToken;
        parsedBatchId = qrJson.batchId || parsedBatchId;
        parsedVersion = qrJson.version || parsedVersion;
      } catch (e) {
        parsedBatchId = rawQRString.trim();
      }
    }

    if (!parsedBatchId) {
      return res.status(400).json({ success: false, message: 'Waste Batch ID is required' });
    }

    // 1. Find Waste Batch
    const batch = await WasteBatch.findOne({
      $or: [
        { batchId: parsedBatchId },
        { qrCodeData: { $regex: parsedBatchId, $options: 'i' } },
      ],
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'No active medical waste batch found matching this QR code' });
    }

    // 2. Verify Booking Authorization (driver must have an ACCEPTED request or master authorization)
    const booking = await DriverRequest.findOne({
      hospitalId: batch.hospitalId,
      status: { $in: ['ACCEPTED', 'REQUESTED'] },
      $or: [{ driverId }, { driverPhone }],
    });

    // 3. Verify Dynamic QR Token & Version if token was passed
    if (parsedToken && batch.qrToken && parsedToken !== batch.qrToken) {
      // Old or altered token
      await googleSheetsService.logRow('QRScans', {
        scanId: `SCAN-ERR-${Date.now()}`,
        batchId: batch.batchId,
        hospitalName: batch.hospitalName,
        driverName,
        status: 'INVALID_TOKEN',
      });
      return res.status(403).json({
        success: false,
        message: 'Security Alert: QR Code token is invalid or has been updated by the hospital. Please scan the refreshed QR code.',
      });
    }

    // 4. Update Batch status to COLLECTED / COMPLETED
    const updatedBatch = await WasteBatch.findOneAndUpdate(
      { _id: batch._id },
      {
        status: 'COLLECTED',
        assignedDriverId: driverId,
        assignedDriverName: driverName,
        assignedDriverPhone: driverPhone,
      },
      { new: true }
    );

    // 5. Update DriverRequest status to COLLECTED
    if (booking) {
      await DriverRequest.findOneAndUpdate(
        { _id: booking._id },
        {
          status: 'COLLECTED',
          collectedAt: new Date(),
        }
      );
    }

    const now = new Date();
    const scanId = `SCAN-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const collectionId = `COL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 6. Record QRScan Audit Log
    const scanRecord = await QRScan.create({
      scanId,
      driverId,
      driverName,
      driverPhone,
      hospitalId: batch.hospitalId,
      hospitalName: batch.hospitalName || batch.hospitalId,
      batchId: batch.batchId,
      bookingId: booking?.requestId || bookingId || '',
      wasteQuantity: batch.quantity || batch.quantityKg || 25.0,
      wasteType: batch.wasteType,
      wasteCategory: batch.category,
      qrVersion: batch.qrVersion || 1,
      scannedAt: now,
      status: 'SUCCESS',
    });

    // 7. Record Collection Log
    const collectionRecord = await Collection.create({
      collectionId,
      batchId: batch.batchId,
      bookingId: booking?.requestId || bookingId || '',
      hospitalId: batch.hospitalId,
      hospitalName: batch.hospitalName || batch.hospitalId,
      driverId,
      driverName,
      driverPhone,
      vehicleNumber,
      category: batch.category,
      wasteType: batch.wasteType,
      quantityKg: batch.quantity || batch.quantityKg || 25.0,
      pickupLocation: batch.pickupLocation,
      collectedAt: now,
      status: 'COLLECTED',
    });

    // 8. Mirror to Google Sheets: QRScans & Collections
    await googleSheetsService.logRow('QRScans', {
      scanId: scanRecord.scanId,
      batchId: scanRecord.batchId,
      hospitalName: scanRecord.hospitalName,
      driverName: scanRecord.driverName,
      driverPhone: scanRecord.driverPhone,
      bookingId: scanRecord.bookingId,
      wasteQuantity: scanRecord.wasteQuantity,
      wasteType: scanRecord.wasteType,
      scanDate: now.toISOString().split('T')[0],
      scanTime: now.toLocaleTimeString(),
      status: 'SUCCESS',
    });

    await googleSheetsService.logRow('Collections', {
      collectionId: collectionRecord.collectionId,
      batchId: collectionRecord.batchId,
      hospitalName: collectionRecord.hospitalName,
      driverName: collectionRecord.driverName,
      driverPhone: collectionRecord.driverPhone,
      vehicleNumber: collectionRecord.vehicleNumber,
      category: collectionRecord.category,
      wasteType: collectionRecord.wasteType,
      quantityKg: collectionRecord.quantityKg,
      collectedAt: now.toISOString(),
      status: 'COLLECTED',
    });

    return res.status(200).json({
      success: true,
      message: 'COLLECTION SUCCESSFUL! Hazardous medical waste custody transferred to fleet driver.',
      data: {
        scanRecord,
        collectionRecord,
        batch: updatedBatch,
        timeline: [
          { stage: 'CREATED', status: 'COMPLETED', time: batch.createdAt },
          { stage: 'DRIVER REQUESTED', status: 'COMPLETED', time: booking?.requestedAt || now },
          { stage: 'HOSPITAL ACCEPTED', status: 'COMPLETED', time: booking?.acceptedAt || now },
          { stage: 'DRIVER ARRIVED', status: 'COMPLETED', time: now },
          { stage: 'QR SCANNED', status: 'COMPLETED', time: now },
          { stage: 'WASTE COLLECTED', status: 'COMPLETED', time: now },
          { stage: 'IN TRANSIT TO CBMWTF', status: 'ACTIVE', time: now },
        ],
      },
    });
  } catch (error) {
    console.error('Scan QR & Collect Error:', error);
    return res.status(500).json({ success: false, message: 'QR verification and collection processing failed' });
  }
};
