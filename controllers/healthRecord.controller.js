const HealthRecord = require('../models/healthRecord.model');
const User = require('../models/user.model');
const HealthRecordService = require('../services/healthRecord.service');
const EncryptionService = require('../services/encryption.service');
const IPFSService = require('../services/ipfs.service');

exports.submitRecord = async (req, res) => {
  try {
    const recordData = req.body;

    // Verify if user exists using email
    const patient = await User.findOne({ email: recordData.patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found. Please verify the patient email.'
      });
    }

    // Generate patientIdHash using patient's email
    const patientIdHash = HealthRecordService.generatePatientIdHash(patient.email);

    // Add input sanitization
    if (!recordData.content || typeof recordData.content === 'object') {
      recordData.content = JSON.stringify(recordData.content);
    }

    // Add size validation
    if (Buffer.from(recordData.content).length > 1048576) { // 1MB limit
      throw new Error('Content size exceeds limit of 1MB');
    }

    // Validate input
    HealthRecordService.validateHealthRecord(recordData);

    // Process and split data
    const { publicData, encryptionKey, ipfsHash } = await HealthRecordService.splitAndProcessData(recordData);

    // Create record with required fields
    const healthRecord = new HealthRecord({
      documentId: HealthRecordService.generateDocumentId(),
      patientIdHash: patientIdHash,  // Store hashed patient ID
      metadata: {
        ...publicData.metadata,
        timestamp: Date.now(),
        version: '1.0',
        lastModified: new Date(),
        patientEmail: patient.email  // Optionally store reference to patient
      },
      storage: {
        ipfsHash,
        encryptionKeyReference: encryptionKey
      },
      status: 'stored'
    });

    await healthRecord.save();

    // Associate record with user
    patient.healthRecords = patient.healthRecords || [];
    patient.healthRecords.push(healthRecord._id);
    await patient.save();

    return res.status(201).json({
      success: true,
      message: 'Health record submitted successfully',
      documentId: healthRecord.documentId,
      metadata: publicData.metadata
    });
  } catch (error) {
    console.error('Error submitting record:', error);
    return res.status(error.message.includes('limit') ? 413 : 500).json({
      success: false,
      message: 'Failed to submit health record',
      error: error.message
    });
  }
};

exports.getRecordById = async (req, res) => {
  const { id } = req.params;

  try {
    // Add ID validation
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID format'
      });
    }

    const record = await HealthRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Return public data with metadata and patientIdHash
    return res.status(200).json({
      success: true,
      record: {
        documentId: record.documentId,
        patientIdHash: record.patientIdHash,  // Added this line
        metadata: {
          provider: record.metadata.provider,
          facility: record.metadata.facility,
          timestamp: record.metadata.timestamp,
        },
        status: record.status
      }
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch health record',
      error: error.message
    });
  }
};



// Also add a method to get record by patientIdHash
exports.getRecordsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const hashedPatientId = HealthRecordService._hashPatientId(patientId);
    
    const records = await HealthRecord.find({ patientIdHash: hashedPatientId });
    
    return res.status(200).json({
      success: true,
      records: records.map(record => ({
        documentId: record.documentId,
        patientIdHash: record.patientIdHash,
        metadata: record.metadata,
        status: record.status
      }))
    });
  } catch (error) {
    console.error('Error fetching records by patient ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch health records',
      error: error.message
    });
  }
};
