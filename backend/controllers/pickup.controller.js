const {
  PickupRequest,
  WasteBatch,
  Hospital,
  Vehicle,
  User,
  Notification,
} = require('../models');

// @desc    Get all pickup requests with filters
// @route   GET /api/pickups
// @access  Protected
exports.getPickups = async (req, res) => {
  try {
    const { hospitalId, driverId, status, priority } = req.query;
    let query = {};

    // Hospital role restriction
    if (req.user && req.user.role === 'hospital_admin' && req.user.hospitalId) {
      query.hospitalId = req.user.hospitalId;
    } else if (hospitalId && hospitalId !== 'All') {
      query.hospitalId = hospitalId;
    }

    // Driver role restriction
    if (req.user && req.user.role === 'driver') {
      query.assignedDriverId = req.user._id;
    } else if (driverId && driverId !== 'All') {
      query.assignedDriverId = driverId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    const pickups = await PickupRequest.find(query).sort({ createdAt: -1 });

    // Populate hospital names for rich UI
    const hospitalIds = [...new Set(pickups.map(p => p.hospitalId))];
    const hospitals = await Hospital.find({ hospitalId: { $in: hospitalIds } });
    const hospitalMap = {};
    hospitals.forEach(h => {
      hospitalMap[h.hospitalId] = h;
    });

    const enriched = pickups.map(p => ({
      ...p.toObject(),
      hospital: hospitalMap[p.hospitalId] || null,
    }));

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error('Get Pickups Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve pickup requests' });
  }
};

// @desc    Get single pickup request by ID
// @route   GET /api/pickups/:id
// @access  Protected
exports.getPickupById = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await PickupRequest.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { pickupId: id }],
    });

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    const hospital = await Hospital.findOne({ hospitalId: pickup.hospitalId });
    const wasteBatches = await WasteBatch.find({ batchId: { $in: pickup.wasteBatchIds } });
    const vehicle = pickup.assignedVehicleId ? await Vehicle.findById(pickup.assignedVehicleId) : null;

    return res.status(200).json({
      success: true,
      data: {
        ...pickup.toObject(),
        hospital,
        wasteBatches,
        vehicle,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving pickup' });
  }
};

// @desc    Create new pickup request
// @route   POST /api/pickups
// @access  Protected (Hospital Admin / Admin)
exports.createPickupRequest = async (req, res) => {
  try {
    const {
      hospitalId,
      wasteBatchIds,
      wasteCategory,
      wasteQuantity,
      pickupAddress,
      priority,
      preferredDate,
      preferredTimeSlot,
      specialInstructions,
    } = req.body;

    const targetHospitalId = hospitalId || (req.user && req.user.hospitalId) || 'HOSP-TG-001';
    const hospital = await Hospital.findOne({ hospitalId: targetHospitalId });

    // Generate unique Pickup ID: REQ-YYYY-XXXX
    const count = await PickupRequest.countDocuments();
    const pickupId = `REQ-2026-${String(count + 101).padStart(4, '0')}`;

    const newPickup = await PickupRequest.create({
      pickupId,
      hospitalId: targetHospitalId,
      wasteBatchIds: wasteBatchIds || [],
      wasteCategory: wasteCategory || 'Mixed Bio-Medical Waste',
      wasteQuantity: Number(wasteQuantity) || 0,
      pickupAddress: pickupAddress || (hospital ? hospital.address : 'Hospital Premises, Telangana'),
      priority: priority || 'Normal',
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      preferredTimeSlot: preferredTimeSlot || 'Morning (09:00 - 12:00)',
      specialInstructions: specialInstructions || '',
      status: 'Pending',
      timeline: [
        {
          status: 'Pending',
          timestamp: new Date(),
          note: `Pickup request registered by ${req.user ? req.user.name : 'Hospital'}`,
          updatedBy: req.user ? req.user.name : 'Hospital Admin',
        },
      ],
    });

    // Mark waste batches as REQUESTED
    if (wasteBatchIds && wasteBatchIds.length > 0) {
      await WasteBatch.updateMany(
        { batchId: { $in: wasteBatchIds } },
        { status: 'REQUESTED', pickupId }
      );
    }

    // Notify Super Admin
    await Notification.create({
      targetRole: 'super_admin',
      title: priority === 'Emergency' ? '🚨 EMERGENCY Pickup Request' : 'New Waste Pickup Request',
      message: `${hospital ? hospital.name : targetHospitalId} submitted a pickup request for ${wasteQuantity} kg of medical waste (${priority} Priority).`,
      type: priority === 'Emergency' ? 'emergency' : 'pickup',
      link: `/app/pickups?pickupId=${pickupId}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      data: newPickup,
    });
  } catch (error) {
    console.error('Create Pickup Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error creating pickup request' });
  }
};

// @desc    Assign vehicle & driver to pickup request
// @route   POST /api/pickups/:id/assign
// @access  Private (Admin only)
exports.assignPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleId, driverId } = req.body;

    const pickup = await PickupRequest.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { pickupId: id }],
    });

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    let driver = null;
    if (driverId) {
      driver = await User.findById(driverId);
    }

    pickup.assignedVehicleId = vehicle ? vehicle._id : null;
    pickup.assignedVehicleNumber = vehicle ? vehicle.vehicleNumber : 'TS-09-UB-4501';
    pickup.assignedDriverId = driver ? driver._id : (vehicle ? vehicle.driverId : null);
    pickup.assignedDriverName = driver ? driver.name : (vehicle ? vehicle.driverName : 'Fleet Operator');
    pickup.assignedDriverPhone = driver ? driver.phone : (vehicle ? vehicle.driverPhone : '+91 98480 22338');
    pickup.status = 'Assigned';

    pickup.timeline.push({
      status: 'Assigned',
      timestamp: new Date(),
      note: `Assigned to vehicle ${pickup.assignedVehicleNumber} (Driver: ${pickup.assignedDriverName})`,
      updatedBy: req.user ? req.user.name : 'Super Admin',
    });

    await pickup.save();

    // Update vehicle status
    if (vehicle) {
      vehicle.status = 'Assigned';
      vehicle.currentPickupId = pickup.pickupId;
      await vehicle.save();
    }

    // Update waste batches status
    if (pickup.wasteBatchIds && pickup.wasteBatchIds.length > 0) {
      await WasteBatch.updateMany(
        { batchId: { $in: pickup.wasteBatchIds } },
        { status: 'ASSIGNED' }
      );
    }

    // Notify Hospital Admin
    await Notification.create({
      targetRole: 'hospital_admin',
      hospitalId: pickup.hospitalId,
      title: 'Collection Vehicle Assigned',
      message: `Vehicle ${pickup.assignedVehicleNumber} (${pickup.assignedDriverName}) has been dispatched for pickup ${pickup.pickupId}.`,
      type: 'dispatch',
      link: `/app/pickups?pickupId=${pickup.pickupId}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Vehicle and driver assigned successfully',
      data: pickup,
    });
  } catch (error) {
    console.error('Assign Pickup Error:', error);
    return res.status(500).json({ success: false, message: 'Error assigning vehicle to pickup' });
  }
};

// @desc    Update pickup status (Driver or Admin)
// @route   PUT /api/pickups/:id/status
// @access  Protected
exports.updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, currentLat, currentLng } = req.body;

    const validStatuses = ['Pending', 'Assigned', 'Dispatched', 'Arrived', 'Collected', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const pickup = await PickupRequest.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { pickupId: id }],
    });

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    pickup.status = status;
    pickup.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status} by ${req.user ? req.user.name : 'Operator'}`,
      updatedBy: req.user ? req.user.name : 'Operator',
    });

    await pickup.save();

    // Map pickup status to waste batches status
    const statusMap = {
      Dispatched: 'DISPATCHED',
      Arrived: 'ARRIVED',
      Collected: 'COLLECTED',
      Completed: 'PROCESSED',
    };

    if (statusMap[status] && pickup.wasteBatchIds && pickup.wasteBatchIds.length > 0) {
      await WasteBatch.updateMany(
        { batchId: { $in: pickup.wasteBatchIds } },
        { status: statusMap[status] }
      );
    }

    // Update vehicle status & location if available
    if (pickup.assignedVehicleId) {
      const vehicle = await Vehicle.findById(pickup.assignedVehicleId);
      if (vehicle) {
        if (status === 'Dispatched') vehicle.status = 'En Route';
        if (status === 'Arrived') vehicle.status = 'Collecting';
        if (status === 'Collected') {
          vehicle.status = 'En Route';
          vehicle.currentLoadKg = (vehicle.currentLoadKg || 0) + (pickup.wasteQuantity || 0);
        }
        if (status === 'Completed') {
          vehicle.status = 'Available';
          vehicle.currentPickupId = null;
          vehicle.currentLoadKg = 0;
        }
        if (currentLat && currentLng) {
          vehicle.currentLatitude = currentLat;
          vehicle.currentLongitude = currentLng;
        }
        await vehicle.save();
      }
    }

    // Send notifications
    const notifyHospital = ['Dispatched', 'Arrived', 'Collected', 'Completed'].includes(status);
    if (notifyHospital) {
      await Notification.create({
        targetRole: 'hospital_admin',
        hospitalId: pickup.hospitalId,
        title: `Waste Pickup ${status}`,
        message: `Your pickup request ${pickup.pickupId} has reached status: ${status}.`,
        type: status === 'Completed' ? 'success' : 'info',
        link: `/app/pickups?pickupId=${pickup.pickupId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Pickup status updated to ${status}`,
      data: pickup,
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    return res.status(500).json({ success: false, message: 'Error updating pickup status' });
  }
};
