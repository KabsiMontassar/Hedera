const crypto = require('crypto');
const HederaService = require('./hedera.service');
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

      const { ipfsHash } = await IPFSService.uploadContent(data);

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
