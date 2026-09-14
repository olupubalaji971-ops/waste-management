const { Vehicle, User } = require('../models');

// @desc    Get all collection fleet vehicles
// @route   GET /api/vehicles
// @access  Protected
exports.getVehicles = async (req, res) => {
  try {
    const { status, district } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (district && district !== 'All') {
      query.assignedDistrict = district;
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error('Get Vehicles Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve vehicles' });
  }
};

// @desc    Get single vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Protected
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { vehicleNumber: id }],
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    return res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving vehicle' });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin only)
exports.createVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      vehicleType,
      capacityKg,
      driverName,
      driverPhone,
      assignedDistrict,
      currentLatitude,
      currentLongitude,
    } = req.body;

    const existing = await Vehicle.findOne({ vehicleNumber: vehicleNumber.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Vehicle with this number already exists' });
    }

    const newVehicle = await Vehicle.create({
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType: vehicleType || 'E-Van Bio-Transporter',
      capacityKg: Number(capacityKg) || 800,
      driverName: driverName || 'Fleet Operator',
      driverPhone: driverPhone || '+91 98480 22338',
      assignedDistrict: assignedDistrict || 'Hyderabad',
      currentLatitude: currentLatitude ? parseFloat(currentLatitude) : 17.385,
      currentLongitude: currentLongitude ? parseFloat(currentLongitude) : 78.4867,
      status: 'Available',
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle added to fleet successfully',
      data: newVehicle,
    });
  } catch (error) {
    console.error('Create Vehicle Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error creating vehicle' });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin only)
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { vehicleNumber: id }] },
      req.body,
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating vehicle' });
  }
};

// @desc    Update vehicle GPS location (Simulation / Driver live ping)
// @route   POST /api/vehicles/:id/location
// @access  Protected
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, status } = req.body;

    const vehicle = await Vehicle.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { vehicleNumber: id }],
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (latitude && longitude) {
      vehicle.currentLatitude = parseFloat(latitude);
      vehicle.currentLongitude = parseFloat(longitude);
      vehicle.lastGpsPing = new Date();
    }
    if (status) {
      vehicle.status = status;
    }

    await vehicle.save();

    return res.status(200).json({
      success: true,
      message: 'GPS coordinates updated',
      data: {
        vehicleNumber: vehicle.vehicleNumber,
        currentLatitude: vehicle.currentLatitude,
        currentLongitude: vehicle.currentLongitude,
        status: vehicle.status,
        lastGpsPing: vehicle.lastGpsPing,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating location' });
  }
};
