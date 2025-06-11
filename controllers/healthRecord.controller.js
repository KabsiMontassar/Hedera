const HealthRecord = require('../models/healthRecord.model');
const HealthRecordService = require('../services/healthRecord.service');
const EncryptionService = require('../services/encryption.service');

exports.submitRecord = async (req, res) => {
  console.log('[HealthRecord] Attempting to submit new health record');
  console.debug('[HealthRecord] Request body:', req.body);

  try {
    const recordData = req.body;

    // Validate input
    try {
      HealthRecordService.validateHealthRecord(recordData);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: validationError.message
      });
    }

    // Process and encrypt data
    const processedData = await HealthRecordService.processRecord(recordData);
    
    // Prepare metadata
    const metadata = HealthRecordService.prepareMetadata(recordData);

    // Create record with encrypted data
    const healthRecord = new HealthRecord({
      documentId: metadata.documentId,
      patientIdHash: metadata.patientIdHash,
      metadata: processedData.publicData.metadata,
      storage: {
        encryptedData: processedData.encryptedData.encryptedData,
        iv: processedData.encryptedData.iv,
        authTag: processedData.encryptedData.authTag,
        encryptionKeyReference: processedData.encryptionKey // In production, store this securely
      },
      status: 'encrypted'
    });

    await healthRecord.save();

    console.log(`[HealthRecord] Successfully created record with ID: ${healthRecord._id}`);
    console.debug('[HealthRecord] New record details:', {
      documentId: healthRecord.documentId,
      status: healthRecord.status
    });

    return res.status(201).json({
      success: true,
      message: 'Health record submitted successfully',
      documentId: metadata.documentId
    });
  } catch (error) {
    console.error('[HealthRecord] Error submitting record:', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to submit health record',
      error: error.message
    });
  }
};


exports.getRecordById = async (req, res) => {
  const { id } = req.params;
  console.log(`[HealthRecord] Attempting to fetch record with ID: ${id}`);

  try {
    const record = await HealthRecord.findById(id);

    if (!record) {
      console.log(`[HealthRecord] No record found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    // Decrypt the record content
    const decryptedData = await EncryptionService.decrypt(
      {
        encryptedData: record.storage.encryptedData,
        iv: record.storage.iv,
        authTag: record.storage.authTag
      },
      Buffer.from(record.storage.encryptionKeyReference, 'hex') // In production, fetch key from secure storage
    );

    console.log(`[HealthRecord] Successfully decrypted record: ${record.documentId}`);

    return res.status(200).json({
      success: true,
      record: {
        documentId: record.documentId,
        patientIdHash: record.patientIdHash,
        metadata: record.metadata,
        content: decryptedData,
        status: record.status,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }
    });
  } catch (error) {
    console.error('[HealthRecord] Error fetching/decrypting record:', {
      error: error.message,
      stack: error.stack,
      recordId: id
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch or decrypt health record',
      error: error.message
    });
  }
};
