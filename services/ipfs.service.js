const axios = require('axios');
const FormData = require('form-data');

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
      
      
      const data = new FormData();
      data.append('file', Buffer.from(JSON.stringify(content)), {
        filename: 'MedicalRecord.json',
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
      
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload to IPFS: ' + error.message);
    }
  }


}

module.exports = new IPFSService();
