const crypto = require('crypto');
const HederaService = require('./hedera.service');
const EncryptionService = require('./encryption.service');

class HealthRecordService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
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
    const { publicData, privateData } = EncryptionService.splitData(data);
    
    // Generate encryption key
    const encryptionKey = EncryptionService.generateEncryptionKey();
    
    // Encrypt private data
    const encryptedPackage = await EncryptionService.encrypt(privateData, encryptionKey);
    
    return {
      publicData,
      encryptedData: encryptedPackage,
      encryptionKey: encryptionKey.toString('hex')
    };
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
