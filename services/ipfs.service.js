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
      // Convert content to JSON string if it's an object
      const contentStr = typeof content === 'object' ? 
        JSON.stringify(content) : content.toString();

      const data = new FormData();
      data.append('file', Buffer.from(contentStr), {
        filename: 'content.json',
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

      return response.data.IpfsHash;
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload to IPFS: ' + error.message);
    }
  }

  async getContent(cid) {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
      return response.data;
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      throw new Error('Failed to retrieve from IPFS: ' + error.message);
    }
  }
}

module.exports = new IPFSService();
