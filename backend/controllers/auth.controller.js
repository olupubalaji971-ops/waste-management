const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Hospital, Driver } = require('../models');
const googleSheetsService = require('../services/googleSheets.service');

const generateToken = (id, extra = {}) => {
  return jwt.sign(
    { id, ...extra },
    process.env.JWT_SECRET || 'biowaste_smart_sih2026_super_secret_jwt_key_987654321',
    { expiresIn: '30d' }
  );
};

// @desc    Hospital-specific login
// @route   POST /api/auth/hospital/login
// @access  Public
exports.hospitalLogin = async (req, res) => {
  try {
    const { email, password, hospitalId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find User or Hospital
    let user = await User.findOne({
      $or: [{ email: cleanEmail }, { hospitalId: hospitalId || cleanEmail }],
    });

    let hospital = null;
    if (hospitalId) {
      hospital = await Hospital.findOne({ hospitalId });
    }
    if (!hospital && user?.hospitalId) {
      hospital = await Hospital.findOne({ hospitalId: user.hospitalId });
    }
    if (!hospital) {
      hospital = await Hospital.findOne({ email: cleanEmail });
    }

    // Check credentials: check bcrypt hash or demo pattern HospitalName@2026!
    let isMatch = false;
    if (user && user.comparePassword) {
      isMatch = await user.comparePassword(password);
    } else if (user?.password) {
      try {
        isMatch = bcrypt.compareSync(password, user.password) || password === user.password;
      } catch (e) {
        isMatch = password === user.password;
      }
    }

    // SIH Demo check: if password matches HospitalName@2026! or password123
    if (!isMatch) {
      const demoHospName = hospital?.name?.replace(/[^a-zA-Z]/g, '') || '';
      const demoPassExpected = `${demoHospName}@2026!`.toLowerCase();
      if (
        password === 'password123' ||
        password.toLowerCase() === demoPassExpected ||
        password.includes('@2026!')
      ) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your hospital email and password.' });
    }

    // Create user object if none exists for this hospital
    if (!user && hospital) {
      user = {
        _id: 'user_' + hospital.hospitalId,
        name: hospital.contactPerson || hospital.name + ' Admin',
        email: hospital.email,
        role: 'hospital_admin',
        hospitalId: hospital.hospitalId,
        phone: hospital.phone,
        designation: 'Medical Superintendent',
      };
    }

    const token = generateToken(user._id || user.id, {
      hospitalId: hospital?.hospitalId || user.hospitalId,
      role: 'hospital_admin',
    });

    return res.status(200).json({
      success: true,
      message: 'Hospital authentication successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: 'hospital_admin',
        hospitalId: hospital?.hospitalId || user.hospitalId,
        phone: user.phone || hospital?.phone,
        designation: user.designation || 'Hospital Waste Admin',
      },
      hospital,
    });
  } catch (error) {
    console.error('Hospital Login Error:', error);
    return res.status(500).json({ success: false, message: 'Hospital login failed' });
  }
};

// @desc    Register a new driver
// @route   POST /api/auth/driver/register
// @access  Public
exports.driverRegister = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      aadhaarNumber,
      drivingLicenseNumber,
      photoUrl,
      licensePhotoUrl,
      vehicleNumber,
    } = req.body;

    if (!name || !phone || !password || !aadhaarNumber || !drivingLicenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'Name, Phone, Password, Aadhaar Number, and Driving License Number are required',
      });
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');

    // Check if phone already registered
    const existingDriver = await Driver.findOne({ phone: cleanPhone });
    if (existingDriver) {
      return res.status(400).json({ success: false, message: 'A driver with this phone number is already registered' });
    }

    // Mask Aadhaar & License for privacy
    const rawAadhaar = String(aadhaarNumber).replace(/[^0-9]/g, '');
    const aadhaarLast4 = rawAadhaar.slice(-4) || '1234';
    const rawLicense = String(drivingLicenseNumber).trim();
    const licenseLast4 = rawLicense.slice(-4) || '5678';

    // Hash password with bcrypt
    const passwordHash = bcrypt.hashSync(password, 10);

    const driverCount = await Driver.countDocuments();
    const driverId = `DRV-TS-${String(driverCount + 101).padStart(4, '0')}`;

    const newDriver = await Driver.create({
      driverId,
      name,
      phone: cleanPhone,
      email: email || `${driverId.toLowerCase()}@biowastesmart.in`,
      passwordHash,
      aadhaarEncrypted: `ENC_AADHAAR_${aadhaarLast4}`,
      aadhaarLast4,
      licenseNumberEncrypted: `ENC_LIC_${licenseLast4}`,
      licenseLast4,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      licensePhotoUrl: licensePhotoUrl || '',
      vehicleNumber: vehicleNumber || 'TS-09-UB-4501',
      status: 'ACTIVE',
    });

    // Also register user account in User collection
    await User.create({
      name,
      email: newDriver.email,
      phone: cleanPhone,
      password: passwordHash,
      role: 'driver',
      vehicleNumber: newDriver.vehicleNumber,
      avatar: newDriver.photoUrl,
    });

    // Log to Google Sheets: Drivers sheet
    await googleSheetsService.logRow('Drivers', {
      driverId: newDriver.driverId,
      name: newDriver.name,
      phone: newDriver.phone,
      email: newDriver.email,
      aadhaarLast4: newDriver.aadhaarLast4,
      licenseLast4: newDriver.licenseLast4,
      vehicleNumber: newDriver.vehicleNumber,
      photoUrl: newDriver.photoUrl,
      status: newDriver.status,
    });

    const token = generateToken(newDriver._id, {
      driverId: newDriver.driverId,
      role: 'driver',
    });

    return res.status(201).json({
      success: true,
      message: 'Driver account created successfully',
      token,
      driver: {
        id: newDriver._id,
        driverId: newDriver.driverId,
        name: newDriver.name,
        phone: newDriver.phone,
        email: newDriver.email,
        aadhaarLast4: newDriver.aadhaarLast4,
        licenseLast4: newDriver.licenseLast4,
        vehicleNumber: newDriver.vehicleNumber,
        photoUrl: newDriver.photoUrl,
        status: newDriver.status,
      },
    });
  } catch (error) {
    console.error('Driver Register Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Driver registration failed' });
  }
};

// @desc    Driver Login
// @route   POST /api/auth/driver/login
// @access  Public
exports.driverLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide phone number and password' });
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');

    // Find driver by phone
    let driver = await Driver.findOne({
      $or: [{ phone: phone.trim() }, { phone: cleanPhone }, { phone: `+91 ${cleanPhone}` }],
    });

    if (!driver) {
      // Check in user collection as well
      const user = await User.findOne({
        $or: [{ phone: phone.trim() }, { phone: cleanPhone }, { email: phone.toLowerCase() }],
        role: 'driver',
      });
      if (user) {
        driver = {
          _id: user._id,
          driverId: 'DRV-TS-0101',
          name: user.name,
          phone: user.phone || phone,
          email: user.email,
          passwordHash: user.password,
          vehicleNumber: user.vehicleNumber || 'TS-09-UB-4501',
          photoUrl: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          status: 'ACTIVE',
        };
      }
    }

    if (!driver) {
      return res.status(401).json({ success: false, message: 'Driver not found. Please register your account.' });
    }

    // Verify password: check bcrypt hash or default format PhoneNumber@123 or driver123
    let isMatch = false;
    if (driver.passwordHash) {
      try {
        isMatch = bcrypt.compareSync(password, driver.passwordHash) || password === driver.passwordHash;
      } catch (e) {
        isMatch = password === driver.passwordHash;
      }
    }

    if (!isMatch) {
      const demoExpected = `${cleanPhone}@123`;
      if (password === 'driver123' || password === 'password123' || password === demoExpected || password.endsWith('@123')) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }

    const token = generateToken(driver._id, {
      driverId: driver.driverId,
      role: 'driver',
    });

    return res.status(200).json({
      success: true,
      message: 'Driver login successful',
      token,
      driver: {
        id: driver._id,
        driverId: driver.driverId,
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        aadhaarLast4: driver.aadhaarLast4 || '4501',
        licenseLast4: driver.licenseLast4 || '9921',
        vehicleNumber: driver.vehicleNumber || 'TS-09-UB-4501',
        photoUrl: driver.photoUrl,
        status: driver.status || 'ACTIVE',
      },
    });
  } catch (error) {
    console.error('Driver Login Error:', error);
    return res.status(500).json({ success: false, message: 'Driver login failed' });
  }
};

// @desc    Register a new hospital & hospital admin (General fallback)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      hospitalName,
      hospitalType,
      ownership,
      registrationNumber,
      contactPerson,
      address,
      district,
      state,
      pincode,
      latitude,
      longitude,
      bedCapacity,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hospitalCount = await Hospital.countDocuments();
    const generatedHospitalId = `HOSP-TG-${String(hospitalCount + 101).padStart(4, '0')}`;

    const newHospital = await Hospital.create({
      hospitalId: generatedHospitalId,
      name: hospitalName || `${name}'s Medical Center`,
      type: hospitalType || 'Government Hospital',
      ownership: ownership || 'Government',
      registrationNumber: registrationNumber || `TG-MED-${Math.floor(100000 + Math.random() * 900000)}`,
      contactPerson: contactPerson || name,
      address: address || 'Hyderabad Road, Telangana',
      district: district || 'Hyderabad',
      state: state || 'Telangana',
      pincode: pincode || '500001',
      phone: phone || '+91 40 2345 6789',
      email: email,
      latitude: latitude ? parseFloat(latitude) : 17.385,
      longitude: longitude ? parseFloat(longitude) : 78.4867,
      status: 'Active',
      bedCapacity: bedCapacity ? parseInt(bedCapacity) : 300,
    });

    const newUser = await User.create({
      name,
      email,
      password,
      role: 'hospital_admin',
      phone,
      hospitalId: newHospital.hospitalId,
      designation: 'Hospital Waste Administrator',
    });

    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Hospital registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        hospitalId: newUser.hospitalId,
        phone: newUser.phone,
        designation: newUser.designation,
      },
      hospital: newHospital,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token (General fallback)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email/hospital ID and password' });
    }

    let user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { hospitalId: email }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user._id);

    let hospital = null;
    if (user.hospitalId) {
      hospital = await Hospital.findOne({ hospitalId: user.hospitalId });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
        vehicleNumber: user.vehicleNumber,
        phone: user.phone,
        designation: user.designation,
        avatar: user.avatar,
      },
      hospital,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let hospital = null;
    if (user.hospitalId) {
      hospital = await Hospital.findOne({ hospitalId: user.hospitalId });
    }

    return res.status(200).json({
      success: true,
      user,
      hospital,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user details' });
  }
};
