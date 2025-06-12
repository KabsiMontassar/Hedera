const HealthRecord = require('../models/healthRecord.model');
const HealthRecordService = require('../services/healthRecord.service');
const EncryptionService = require('../services/encryption.service');
const IPFSService = require('../services/ipfs.service');

exports.submitRecord = async (req, res) => {
  try {
    const recordData = req.body;

    // Validate input
    HealthRecordService.validateHealthRecord(recordData);

    // Process and split data
    const { publicData, encryptionKey, ipfsHash } = await HealthRecordService.splitAndProcessData(recordData);

    // Create record with required fields
    const healthRecord = new HealthRecord({
      documentId: HealthRecordService.generateDocumentId(),
      patientIdHash: HealthRecordService._hashPatientId(recordData.patientId),  // This was the error
      metadata: {
        ...publicData.metadata,
        timestamp: Date.now(),
        version: '1.0',
        lastModified: new Date()
      },
      storage: {
        ipfsHash,
        encryptionKeyReference: encryptionKey
      },
      status: 'stored'
    });

    await healthRecord.save();

    return res.status(201).json({
      success: true,
      message: 'Health record submitted successfully',
      documentId: healthRecord.documentId,
      metadata: publicData.metadata
    });
  } catch (error) {
    console.error('Error submitting record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit health record',
      error: error.message
    });
  }
};

exports.getRecordById = async (req, res) => {
  const { id } = req.params;

  try {
    const record = await HealthRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Return public data with metadata
    return res.status(200).json({
      success: true,
      record: {
        documentId: record.documentId,
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

// Add new endpoint to get private data
exports.getPrivateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await HealthRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Get encrypted content from IPFS
    const encryptedContent = await IPFSService.getContent(record.storage.ipfsHash);
    
    // Decrypt the content
    const decryptedData = await EncryptionService.decrypt(
      encryptedContent,
      Buffer.from(record.storage.encryptionKeyReference, 'hex')
    );

    return res.status(200).json({
      success: true,
      privateContent: decryptedData
    });
  } catch (error) {
    console.error('Error retrieving private content:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve private content',
      error: error.message
    });
  }
};
