const crypto = require('crypto');
const HederaService = require('./hedera.service');
const EncryptionService = require('./encryption.service');
const IPFSService = require('./ipfs.service');

class HealthRecordService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
  }

  async splitAndProcessData(data) {
    // Public data that will be stored in MongoDB
    const publicData = {
      metadata: {
        provider: data.metadata?.provider || 'Unknown',
        facility: data.metadata?.facility || 'Unknown',
        date: new Date().toISOString(),
        type: 'health_record',
        version: '1.0'
      }
    };

    // Private data that will be encrypted and stored in IPFS
    const privateData = {
      patientId: data.patientId,
      content: data.content,
      fullMetadata: data.metadata || {}
    };

    // Encrypt private data
    const encryptionKey = await EncryptionService.generateEncryptionKey();
    const encryptedPrivate = await EncryptionService.encrypt(privateData, encryptionKey);
    
    // Store encrypted data in IPFS
    const ipfsHash = await IPFSService.uploadContent(encryptedPrivate);

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

  splitData(data) {
    const publicData = {
      metadata: {
        provider: data.metadata?.provider || 'Unknown Provider',
        facility: data.metadata?.facility || 'Unknown Facility',
        date: data.metadata?.date || new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        version: '1.0',
        type: 'health_record'
      }
    };

    const privateData = {
      content: typeof data.content === 'object' ? data.content : { notes: data.content },
      patientId: data.patientId,
      metadata: data.metadata // Include full metadata in private data for complete record
    };

    console.log('Split Data - Public:', publicData);
    console.log('Split Data - Private:', privateData);

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
