const crypto = require('crypto');

class EncryptionService {
  static ALGORITHM = 'aes-256-gcm';
  static KEY_LENGTH = 32;
  static IV_LENGTH = 16;
  static AUTH_TAG_LENGTH = 16;

  generateEncryptionKey() {
    return crypto.randomBytes(EncryptionService.KEY_LENGTH);
  }

  async encrypt(data, key) {
    try {
      const iv = crypto.randomBytes(EncryptionService.IV_LENGTH);
      const cipher = crypto.createCipheriv(EncryptionService.ALGORITHM, key, iv);
      
      let encryptedData = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encryptedData += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();

      return {
        encryptedData,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decrypt(encryptedPackage, key) {
    try {
      const decipher = crypto.createDecipheriv(
        EncryptionService.ALGORITHM,
        key,
        Buffer.from(encryptedPackage.iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(encryptedPackage.authTag, 'hex'));
      
      let decryptedData = decipher.update(encryptedPackage.encryptedData, 'hex', 'utf8');
      decryptedData += decipher.final('utf8');
      
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  splitData(data) {
    const publicData = {
      metadata: {
        timestamp: data.timestamp || Date.now(),
        version: data.version || '1.0',
        type: data.type || 'health_record'
      }
    };

    const privateData = {
      content: data.content,
      patientInfo: data.patientInfo,
      sensitiveData: data.sensitiveData
    };

    return { publicData, privateData };
  }
}

module.exports = new EncryptionService();
