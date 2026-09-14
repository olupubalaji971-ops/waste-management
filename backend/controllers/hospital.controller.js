const crypto = require('crypto');
const { Hospital, WasteBatch, DriverRequest, Collection, Notification } = require('../models');
const googleSheetsService = require('../services/googleSheets.service');

// @desc    Get all hospitals directory
// @route   GET /api/hospitals
// @access  Public
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: 'Active' });

    // Attach current active waste summary for each hospital
    const hospitalList = await Promise.all(
      hospitals.map(async (h) => {
        const hObj = h.toObject ? h.toObject() : { ...h };
        const activeBatches = await WasteBatch.find({
          hospitalId: h.hospitalId,
          status: { $in: ['GENERATED', 'REQUESTED', 'ACCEPTED'] },
        });

        const availableWasteKg = activeBatches.reduce((acc, b) => acc + (b.quantity || b.quantityKg || 0), 0);
        const categories = [...new Set(activeBatches.map((b) => b.category))];

        return {
          ...hObj,
          beds: hObj.beds || hObj.bedCapacity || 200,
          estimatedWaste: hObj.estimatedWaste || `${Math.round(hObj.beds * 0.1)} kg/day`,
          availableWasteKg: Math.round(availableWasteKg * 10) / 10,
          activeBatchesCount: activeBatches.length,
          availableCategories: categories.length > 0 ? categories : ['YELLOW', 'RED'],
          pickupStatus: activeBatches.length > 0 ? 'READY_FOR_PICKUP' : 'ALL_COLLECTED',
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: hospitalList.length,
      data: hospitalList,
    });
  } catch (error) {
    console.error('Get Hospitals Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve hospital directory' });
  }
};

// @desc    Get single hospital by ID
// @route   GET /api/hospitals/:id
// @access  Public
exports.getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findOne({
      $or: [{ hospitalId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    return res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving hospital details' });
  }
};

// @desc    Get individual hospital dashboard metrics
// @route   GET /api/hospital/dashboard
// @access  Protected (Hospital Admin)
exports.getHospitalDashboard = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId || req.query.hospitalId || 'HOSP-TG-001';

    const hospital = await Hospital.findOne({ hospitalId });
    const allBatches = await WasteBatch.find({ hospitalId });
    const driverRequests = await DriverRequest.find({ hospitalId });
    const collections = await Collection.find({ hospitalId });

    const totalWasteKg = allBatches.reduce((sum, b) => sum + (b.quantity || b.quantityKg || 0), 0);
    const activeBatches = allBatches.filter((b) => ['GENERATED', 'REQUESTED', 'ACCEPTED'].includes(b.status));
    const pendingRequests = driverRequests.filter((r) => r.status === 'REQUESTED');
    const completedCollections = allBatches.filter((b) => ['COLLECTED', 'PROCESSED', 'COMPLETED'].includes(b.status));

    return res.status(200).json({
      success: true,
      data: {
        hospital,
        stats: {
          totalWasteGeneratedKg: Math.round(totalWasteKg * 10) / 10,
          activeWasteBatchesCount: activeBatches.length,
          pendingDriverRequestsCount: pendingRequests.length,
          completedCollectionsCount: completedCollections.length,
        },
        activeBatches,
        driverRequests: driverRequests.slice(0, 10),
        collections: collections.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Hospital Dashboard Error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving hospital dashboard data' });
  }
};

// @desc    Create new waste batch with dynamic versioned QR
// @route   POST /api/hospital/waste-batches
// @access  Protected (Hospital Admin)
exports.createHospitalWasteBatch = async (req, res) => {
  try {
    const {
      category,
      wasteType,
      quantityKg,
      quantity,
      unit,
      collectionDate,
      collectionTime,
      pickupLocation,
      contactPerson,
      pickupPhone,
      pickupInstructions,
      notes,
    } = req.body;

    const hospitalId = req.user?.hospitalId || req.body.hospitalId || 'HOSP-TG-001';
    const hospital = await Hospital.findOne({ hospitalId });
    const hospitalShortCode = hospital?.name?.split(' ')[0]?.toUpperCase() || 'HOSP';

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const batchId = `BWS-${hospitalShortCode}-${now.getFullYear()}-${randomSeq}`;

    const parsedQty = parseFloat(quantityKg || quantity || 25.0);
    const qrVersion = 1;
    const qrToken = crypto.randomBytes(16).toString('hex');

    const qrCodeData = JSON.stringify({
      batchId,
      version: qrVersion,
      token: qrToken,
    });

    const newBatch = await WasteBatch.create({
      batchId,
      hospitalId,
      hospitalName: hospital?.name || hospitalId,
      category: (category || 'YELLOW').toUpperCase(),
      wasteType: wasteType || 'Biomedical Soiled Waste',
      quantityKg: parsedQty,
      quantity: parsedQty,
      unit: unit || 'kg',
      collectionDate: collectionDate || now.toISOString().split('T')[0],
      collectionTime: collectionTime || now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      date: collectionDate || now.toISOString().split('T')[0],
      time: collectionTime || now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      pickupLocation: pickupLocation || hospital?.address || 'Biomedical Waste Yard Gate 2',
      contactPerson: contactPerson || hospital?.contactPerson || 'Hospital Admin',
      pickupPhone: pickupPhone || hospital?.phone || '+91 40 2750 5566',
      pickupInstructions: pickupInstructions || 'Autoclaved and double-bagged with biohazard label.',
      notes: notes || '',
      qrVersion,
      qrToken,
      qrCodeData,
      status: 'GENERATED',
      createdBy: req.user?.name || 'Medical Staff',
    });

    // Mirror to Google Sheets: WasteBatches
    await googleSheetsService.logRow('WasteBatches', {
      batchId: newBatch.batchId,
      hospitalName: newBatch.hospitalName,
      category: newBatch.category,
      wasteType: newBatch.wasteType,
      quantityKg: newBatch.quantityKg,
      collectionDate: newBatch.collectionDate,
      collectionTime: newBatch.collectionTime,
      pickupLocation: newBatch.pickupLocation,
      qrVersion: newBatch.qrVersion,
      status: newBatch.status,
    });

    // Create Notification
    await Notification.create({
      targetRole: 'hospital_admin',
      hospitalId,
      title: 'New Dynamic Waste Batch Generated',
      message: `Batch ${batchId} (${parsedQty} kg ${category}) created with Dynamic QR v1.`,
      type: 'info',
    });

    return res.status(201).json({
      success: true,
      message: 'Waste batch created with dynamic versioned QR code',
      data: newBatch,
    });
  } catch (error) {
    console.error('Create Waste Batch Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error creating waste batch' });
  }
};

// @desc    Update waste batch and automatically increment QR version & token
// @route   PUT /api/hospital/waste-batches/:id
// @access  Protected (Hospital Admin)
exports.updateHospitalWasteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityKg, quantity, wasteType, pickupLocation, pickupInstructions, notes } = req.body;

    const existingBatch = await WasteBatch.findOne({
      $or: [{ batchId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!existingBatch) {
      return res.status(404).json({ success: false, message: 'Waste batch not found' });
    }

    // Increment QR Version and generate new Token (invalidates old QR)
    const newVersion = (existingBatch.qrVersion || 1) + 1;
    const newToken = crypto.randomBytes(16).toString('hex');
    const newQty = quantityKg || quantity ? parseFloat(quantityKg || quantity) : existingBatch.quantity;

    const updatedQrData = JSON.stringify({
      batchId: existingBatch.batchId,
      version: newVersion,
      token: newToken,
    });

    const updatedBatch = await WasteBatch.findOneAndUpdate(
      { _id: existingBatch._id },
      {
        quantity: newQty,
        quantityKg: newQty,
        wasteType: wasteType || existingBatch.wasteType,
        pickupLocation: pickupLocation || existingBatch.pickupLocation,
        pickupInstructions: pickupInstructions || existingBatch.pickupInstructions,
        notes: notes !== undefined ? notes : existingBatch.notes,
        qrVersion: newVersion,
        qrToken: newToken,
        qrCodeData: updatedQrData,
      },
      { new: true }
    );

    // Mirror update to Google Sheets
    await googleSheetsService.logRow('WasteBatches', {
      batchId: updatedBatch.batchId,
      hospitalName: updatedBatch.hospitalName,
      category: updatedBatch.category,
      wasteType: updatedBatch.wasteType,
      quantityKg: updatedBatch.quantityKg,
      qrVersion: updatedBatch.qrVersion,
      status: `UPDATED (v${newVersion})`,
    });

    return res.status(200).json({
      success: true,
      message: `Waste batch updated. QR regenerated to Version ${newVersion}`,
      data: updatedBatch,
    });
  } catch (error) {
    console.error('Update Waste Batch Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update waste batch' });
  }
};

// @desc    Get driver collection requests for hospital
// @route   GET /api/hospital/driver-requests
// @access  Protected (Hospital Admin)
exports.getHospitalDriverRequests = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId || req.query.hospitalId || 'HOSP-TG-001';
    const requests = await DriverRequest.find({ hospitalId });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving driver requests' });
  }
};

// @desc    Accept a driver collection request
// @route   PUT /api/hospital/driver-requests/:id/accept
// @access  Protected (Hospital Admin)
exports.acceptDriverRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DriverRequest.findOne({
      $or: [{ requestId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Driver booking request not found' });
    }

    const updatedRequest = await DriverRequest.findOneAndUpdate(
      { _id: request._id },
      {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      { new: true }
    );

    // Update associated batch status to ACCEPTED and assign driver
    if (request.batchId) {
      await WasteBatch.findOneAndUpdate(
        { batchId: request.batchId },
        {
          status: 'ACCEPTED',
          assignedDriverId: request.driverId,
          assignedDriverName: request.driverName,
          assignedDriverPhone: request.driverPhone,
        }
      );
    }

    // Mirror to Google Sheets: DriverRequests
    await googleSheetsService.logRow('DriverRequests', {
      requestId: updatedRequest.requestId,
      driverName: updatedRequest.driverName,
      driverPhone: updatedRequest.driverPhone,
      hospitalName: updatedRequest.hospitalName,
      batchId: updatedRequest.batchId,
      status: 'ACCEPTED',
      acceptedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: `Driver request accepted! Driver ${request.driverName} is authorized to scan and collect.`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Accept Driver Request Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to accept driver request' });
  }
};

// @desc    Reject a driver collection request
// @route   PUT /api/hospital/driver-requests/:id/reject
// @access  Protected (Hospital Admin)
exports.rejectDriverRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DriverRequest.findOne({
      $or: [{ requestId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Driver booking request not found' });
    }

    const updatedRequest = await DriverRequest.findOneAndUpdate(
      { _id: request._id },
      { status: 'REJECTED' },
      { new: true }
    );

    // Mirror to Google Sheets
    await googleSheetsService.logRow('DriverRequests', {
      requestId: updatedRequest.requestId,
      driverName: updatedRequest.driverName,
      hospitalName: updatedRequest.hospitalName,
      status: 'REJECTED',
    });

    return res.status(200).json({
      success: true,
      message: 'Driver collection request was rejected',
      data: updatedRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reject driver request' });
  }
};
