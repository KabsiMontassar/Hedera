const crypto = require('crypto');
const HederaService = require('./hedera.service');
const EncryptionService = require('./encryption.service');
const IPFSService = require('./ipfs.service');

class HealthRecordService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
  }

  async splitAndProcessData(data) {
    // Public data contains only basic metadata for MongoDB
    const publicData = {
      metadata: {
        provider: data.metadata?.provider || 'Unknown',
        facility: data.metadata?.facility || 'Unknown',
        date: new Date().toISOString(),
        type: 'health_record',
        version: '1.0'
      }
    };

    // Store complete original data in IPFS
    const fullData = {
      ...data,                          // Include all original fields
      timestamp: Date.now(),            // Add timestamp
      version: '1.0',                   // Add version
      originalSubmission: true          // Mark as original data
    };

    // Generate encryption key for future reference
    const encryptionKey = await EncryptionService.generateEncryptionKey();
    
    // Store complete data in IPFS (unencrypted for visibility)
    const ipfsHash = await IPFSService.uploadContent(fullData);

    return {
      publicData,
      encryptionKey: encryptionKey.toString('hex'),
      ipfsHash
    };
  }

  validateHealthRecord(data) {
    const requiredFields = ['patientId', 'content'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return true;
  }

  sanitizeInput(data) {
    return {
      ...data,
      content: this._sanitizeText(data.content),
      patientId: this._sanitizeText(data.patientId),
    };
  }

  generateDocumentId() {
    return `hr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  prepareMetadata(data) {
    return {
      documentId: this.generateDocumentId(),
      timestamp: Date.now(),
      patientIdHash: this._hashPatientId(data.patientId),
      version: '1.0'
    };
  }

  async processRecord(data) {
    // Split data into public and private parts
    const { publicData, privateData } = this.splitData(data);
    
    // Generate encryption key
    const encryptionKey = await EncryptionService.generateEncryptionKey();
    
    // Encrypt private data
    const encryptedPackage = await EncryptionService.encrypt(privateData, encryptionKey);
    
    // Upload encrypted data to IPFS
    const ipfsHash = await IPFSService.uploadContent(encryptedPackage);
    
    // Store reference on Hedera
    const hederaFileId = await HederaService.storeFileReference(ipfsHash);

    return {
      publicData,
      encryptedData: encryptedPackage,
      encryptionKey: encryptionKey.toString('hex'),
      ipfsHash,
      hederaFileId
    };
  }

  // Modify splitData to handle dynamic fields
  splitData(data) {
    // Basic public metadata
    const publicData = {
      metadata: {
        provider: data.metadata?.provider || 'Unknown Provider',
        facility: data.metadata?.facility || 'Unknown Facility',
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        version: '1.0',
        type: 'health_record'
      }
    };

    // Store complete original data structure
    const privateData = {
      originalData: data,               // Store complete original data
      timestamp: Date.now(),
      version: '1.0'
    };

    return { publicData, privateData };
  }

  _sanitizeText(text) {
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[;{}]/g, ''); // Remove potential code injection characters
  }

  _hashPatientId(patientId) {
    return crypto
      .createHash('sha256')
      .update(patientId)
      .digest('hex');
  }
}

module.exports = new HealthRecordService();
