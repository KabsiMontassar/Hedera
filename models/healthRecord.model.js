const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  // Simple unique identifier
  documentId: {
    type: String,
    required: true,
    unique: true
  },
  // Basic metadata
  metadata: {
    provider: String,
    facility: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  // IPFS storage reference
  storage: {
    ipfsHash: String,                 // IPFS location of data
    encryptionKeyReference: String    // Reference to encryption key
  }
}, { timestamps: true });

// Keep timestamp index for sorting
healthRecordSchema.index({ 'metadata.timestamp': -1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
