const crypto = require('crypto');
const HederaService = require('./hedera.service');
const EncryptionService = require('./encryption.service');
const IPFSService = require('./ipfs.service');

class HealthRecordService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
  }

  validateHealthRecord(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid health record data');
    }

    const requiredFields = ['patientId', 'content'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return true;
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

    // Encrypt sensitive data
    const encryptionKey = crypto.randomBytes(32);
    const fullData = {
      ...data,
      timestamp: Date.now(),
      version: '1.0'
    };

    // Store complete data in IPFS
    const ipfsHash = await IPFSService.uploadContent(fullData);

    return {
      publicData,
      encryptionKey: encryptionKey.toString('hex'),
      ipfsHash
    };
  }

  generateDocumentId() {
    return `hr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  _hashPatientId(patientId) {
    return crypto
      .createHash('sha256')
      .update(patientId)
      .digest('hex');
  }

  generatePatientIdHash(email) {
    return crypto
      .createHash('sha256')
      .update(email.toLowerCase())
      .digest('hex');
  }
}

module.exports = new HealthRecordService();
