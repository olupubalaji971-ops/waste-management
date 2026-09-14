const { WasteBatch, Hospital, Notification, PickupRequest, Vehicle, User } = require('../models');

// Knowledge base dictionary for BMW Management Rules 2016
const segregationRules = [
  // WHITE (Sharps)
  {
    keywords: ['syringe', 'needle', 'sharps', 'scalpel', 'blade', 'lancet', 'suture needle', 'trocar', 'biopsy needle', 'lumbar puncture needle', 'cannula stylet'],
    category: 'WHITE',
    container: 'White Translucent, Puncture-Proof, Tamper-Proof Container',
    treatment: 'Autoclaving / Dry Heat Sterilization followed by Shredding / Sharp Pit Encapsulation',
    rationale: 'Sharps (used needles, scalpels, blades, lancets) present high risk of needle-stick injuries and blood-borne viral transmission; must be secured in puncture-resistant rigid containers.',
  },
  // YELLOW (Anatomical, Soiled, Expired Meds, Cytotoxic)
  {
    keywords: ['blood', 'cotton', 'gauze', 'dressing', 'bandage', 'anatomical', 'tissue', 'organ', 'placenta', 'body part', 'expired medicine', 'antibiotic', 'cytotoxic', 'chemotherapy', 'biopsy sample', 'microbiology culture', 'bedding contaminated', 'body fluid', 'amputated', 'fetus', 'animal carcass'],
    category: 'YELLOW',
    container: 'Yellow Non-Chlorinated Plastic Bag / Leak-proof container',
    treatment: 'High-Temperature Incineration / Plasma Pyrolysis / Deep Burial',
    rationale: 'Human/animal anatomical tissues, blood-soaked dressings, swabs, and expired pharmaceuticals are infectious or hazardous chemical agents requiring thermal destruction to neutralize biohazards.',
  },
  // RED (Contaminated Recyclable Plastics)
  {
    keywords: ['tubing', 'iv set', 'iv bottle', 'catheter', 'gloves', 'plastic bottle', 'urine bag', 'dialysis kit', 'rtd kit', 'syringes without needles', 'blood bag empty', 'endotracheal tube', 'suction tube', 'nasogastric tube', 'apron plastic', 'specimen container plastic'],
    category: 'RED',
    container: 'Red Non-Chlorinated Plastic Bag',
    treatment: 'Autoclaving / Microwaving / Hydroclaving followed by Mutilation and Certified Plastic Recycling',
    rationale: 'Infectious plastic medical consumables that can be safely disinfected through autoclaving or microwaving and recycled into non-food grade polymer raw materials.',
  },
  // BLUE (Glassware & Metallic Implants)
  {
    keywords: ['glass', 'vial', 'ampoule', 'medicine vial', 'glass bottle', 'broken glass', 'microscope slide', 'glass petri dish', 'metallic implant', 'orthopedic pin', 'screws', 'stent metal'],
    category: 'BLUE',
    container: 'Puncture-proof and Leak-proof Blue Cardboard Box / Rigid Container with Blue Marking',
    treatment: 'Sodium Hypochlorite 1-2% Disinfection / Autoclaving followed by Glass Recycling Facility',
    rationale: 'Glassware, ampoules, and vials can shatter causing physical punctures and spreading residual chemical toxins; disinfected and recycled separately from plastics.',
  },
  // GENERAL (Non-infectious)
  {
    keywords: ['paper', 'cardboard', 'food', 'apple', 'banana', 'wrapper', 'packaging', 'water bottle', 'tea cup', 'office paper', 'box', 'dry leaves', 'newspaper', 'stationery'],
    category: 'GENERAL',
    container: 'Black / Green Municipal Waste Bins',
    treatment: 'Municipal Composting (Wet Waste) / Solid Waste Recycling (Dry Waste)',
    rationale: 'Non-contaminated domestic and administrative hospital waste that does not contain pathogens or medicinal residue.',
  },
];

// @desc    Get waste batches with filters
// @route   GET /api/waste
// @access  Protected
exports.getWasteBatches = async (req, res) => {
  try {
    const { hospitalId, category, status, search, startDate, endDate } = req.query;
    let query = {};

    // If user is hospital admin, scope to their hospital unless super_admin or authority
    if (req.user && req.user.role === 'hospital_admin' && req.user.hospitalId) {
      query.hospitalId = req.user.hospitalId;
    } else if (hospitalId && hospitalId !== 'All') {
      query.hospitalId = hospitalId;
    }

    if (category && category !== 'All') {
      query.category = category;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { batchId: { $regex: search, $options: 'i' } },
        { wasteType: { $regex: search, $options: 'i' } },
        { hospitalId: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const batches = await WasteBatch.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    console.error('Get Waste Batches Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve waste batches' });
  }
};

// @desc    Get single waste batch by ID or BatchId
// @route   GET /api/waste/:id
// @access  Protected
exports.getWasteBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await WasteBatch.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { batchId: id }],
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Waste batch not found' });
    }

    const hospital = await Hospital.findOne({ hospitalId: batch.hospitalId });

    return res.status(200).json({
      success: true,
      data: {
        ...batch.toObject(),
        hospital,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving batch' });
  }
};

// @desc    Get waste batch by QR Code string
// @route   GET /api/waste/qr/:qrCode
// @access  Public / Protected
exports.getWasteByQRCode = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const batch = await WasteBatch.findOne({
      $or: [{ qrCodeData: qrCode }, { batchId: qrCode }],
    });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'No valid biomedical waste batch found for this QR code' });
    }

    const hospital = await Hospital.findOne({ hospitalId: batch.hospitalId });

    return res.status(200).json({
      success: true,
      data: {
        ...batch.toObject(),
        hospital,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error scanning QR code' });
  }
};

// @desc    Create new medical waste batch
// @route   POST /api/waste
// @access  Protected
exports.createWasteBatch = async (req, res) => {
  try {
    const { hospitalId, category, wasteType, quantity, unit, date, time, notes } = req.body;

    const targetHospitalId = hospitalId || (req.user && req.user.hospitalId) || 'HOSP-TG-001';

    // Generate unique batch ID: WB-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const batchId = `WB-${dateStr}-${randomHex}`;

    // Generate QR payload JSON string
    const qrData = JSON.stringify({
      batchId,
      hospitalId: targetHospitalId,
      category,
      wasteType,
      quantity: Number(quantity),
      unit: unit || 'kg',
      date: date || now.toISOString().split('T')[0],
      system: 'BioWaste Smart - SIH 2026',
    });

    const newBatch = await WasteBatch.create({
      batchId,
      hospitalId: targetHospitalId,
      category: category.toUpperCase(),
      wasteType,
      quantity: Number(quantity),
      unit: unit || 'kg',
      date: date || now.toISOString().split('T')[0],
      time: time || now.toLocaleTimeString('en-US', { hour12: false }),
      notes: notes || '',
      qrCodeData: qrData,
      status: 'GENERATED',
      createdBy: req.user ? req.user.name : 'Medical Staff',
    });

    // Create Notification
    await Notification.create({
      targetRole: 'hospital_admin',
      hospitalId: targetHospitalId,
      title: 'New Waste Batch Logged',
      message: `Batch ${batchId} (${quantity} kg of ${category} waste) was successfully logged with generated QR code.`,
      type: 'info',
      link: `/app/waste-history?batchId=${batchId}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Medical waste batch logged and QR code generated',
      data: newBatch,
    });
  } catch (error) {
    console.error('Create Waste Batch Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error creating waste batch' });
  }
};

// @desc    Smart Waste Segregation Assistant Rule Engine
// @route   POST /api/waste/segregate
// @access  Public / Protected
exports.smartSegregate = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a waste item description or medical term',
      });
    }

    const cleanQuery = query.toLowerCase().trim();
    let bestMatch = null;
    let highestScore = 0;

    for (const rule of segregationRules) {
      let score = 0;
      for (const keyword of rule.keywords) {
        if (cleanQuery.includes(keyword)) {
          score += keyword.length; // weight longer specific matches higher
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = rule;
      }
    }

    // Default fallback if no direct keyword matched
    if (!bestMatch) {
      bestMatch = {
        category: 'YELLOW',
        container: 'Yellow Non-Chlorinated Bag (Precautionary Segregation)',
        treatment: 'Standard BMW Incineration / Safe Sterilization',
        rationale: `Unclassified medical item "${query}". As per Bio-Medical Waste (Management) Rules 2016, any unidentified bio-hazardous clinical item should be isolated in the Yellow stream for infectious waste incineration until verified.`,
      };
    }

    const colorHexMap = {
      YELLOW: '#EAB308',
      RED: '#EF4444',
      WHITE: '#64748B',
      BLUE: '#3B82F6',
      GENERAL: '#10B981',
    };

    return res.status(200).json({
      success: true,
      query,
      result: {
        category: bestMatch.category,
        colorHex: colorHexMap[bestMatch.category] || '#EAB308',
        container: bestMatch.container,
        treatment: bestMatch.treatment,
        rationale: bestMatch.rationale,
      },
    });
  } catch (error) {
    console.error('Segregation Error:', error);
    return res.status(500).json({ success: false, message: 'Segregation analysis failed' });
  }
};

// @desc    Verify authorization code for waste batch
// @desc    Update Waste Batch
// @route   PUT /api/waste/:id
// @access  Protected
exports.updateWasteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await WasteBatch.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { batchId: id }] },
      req.body,
      { new: true }
    );

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Waste batch not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Waste batch updated successfully',
      data: batch,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating waste batch' });
  }
};
