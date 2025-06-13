const axios = require('axios');
const FormData = require('form-data');
const EncryptionService = require('./encryption.service');

class IPFSService {
  constructor() {
    this.apiKey = process.env.PINATA_API_KEY;
    if (!this.apiKey) {
      throw new Error('Pinata API key not configured');
    }
    this.baseURL = 'https://api.pinata.cloud';
  }

  async uploadContent(content) {
    try {
      // Generate encryption key
      const encryptionKey = EncryptionService.generateEncryptionKey();
      
      // Encrypt the content
      const encryptedPackage = await EncryptionService.encrypt(content, encryptionKey);
      
      const data = new FormData();
      data.append('file', Buffer.from(JSON.stringify(encryptedPackage)), {
        filename: 'encrypted_content.json',
        contentType: 'application/json',
      });

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...data.getHeaders()
          }
        }
      );

      return {
        ipfsHash: response.data.IpfsHash,
        encryptionKey: encryptionKey.toString('hex')
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload to IPFS: ' + error.message);
    }
  }

  async getEncryptedContent(cid, encryptionKey) {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
      const encryptedPackage = response.data;
      
      // Decrypt the content
      const decryptedData = await EncryptionService.decrypt(
        encryptedPackage,
        Buffer.from(encryptionKey, 'hex')
      );

      return decryptedData;
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      throw new Error('Failed to retrieve from IPFS: ' + error.message);
    }
  }
}

module.exports = new IPFSService();
