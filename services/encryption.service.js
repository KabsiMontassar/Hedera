const crypto = require('crypto');

class EncryptionService {
    constructor() {
        // Key will be generated once when service is instantiated
        this.secretKey = process.env.ENCRYPTION_KEY || 
            crypto.randomBytes(32).toString('hex');
        
        this.algorithm = 'aes-256-gcm';
    }

    encrypt(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            this.algorithm, 
            Buffer.from(this.secretKey, 'hex'),
            iv
        );
        
        let encryptedData = cipher.update(
            typeof data === 'string' ? data : JSON.stringify(data),
            'utf8',
            'hex'
        );
        encryptedData += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();

        return {
            encryptedData,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }

    decrypt(encryptedData, iv, authTag) {
        const decipher = crypto.createDecipheriv(
            this.algorithm,
            Buffer.from(this.secretKey, 'hex'),
            Buffer.from(iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        
        let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
        decryptedData += decipher.final('utf8');
        
        try {
            return JSON.parse(decryptedData);
        } catch {
            return decryptedData;
        }
    }
}

module.exports = new EncryptionService();
