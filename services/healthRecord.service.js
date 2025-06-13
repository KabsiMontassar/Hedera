const crypto = require('crypto');
const HederaService = require('./hedera.service');
const IPFSService = require('./ipfs.service');
const EncryptionService = require('./encryption.service');

class HealthRecordService {
  constructor() {
    // Remove old encryption-related properties
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

  // Replace old encryption methods with new ones
  encryptData(data) {
    return EncryptionService.encrypt(data);
  }

  decryptData(encryptedData, iv, authTag) {
    return EncryptionService.decrypt(encryptedData, iv, authTag);
  }

  async splitAndProcessData(data) {
    try {
      const publicData = {
        metadata: {
          provider: data.metadata?.provider || 'Unknown',
          facility: data.metadata?.facility || 'Unknown',
          date: new Date().toISOString(),
          type: 'health_record',
          version: '1.0'
        }
      };

      const { encryptedData, iv, authTag } = this.encryptData(data);
      const encryptedContent = {
        content: encryptedData,
        iv,
        authTag,
        version: '2' // Add version to track encryption method
      };

      const { ipfsHash } = await IPFSService.uploadContent(encryptedContent);

      try {
        await HederaService.storeData({
          ipfsHash,
          patientIdHash: this._hashPatientId(data.patientId)
        });
      } catch (hederaError) {
        console.warn('Hedera storage failed, continuing with IPFS only:', hederaError);
      }

      return {
        publicData,
        ipfsHash,
      };
    } catch (error) {
      console.error('Error in splitAndProcessData:', error);
      throw error;
    }
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
