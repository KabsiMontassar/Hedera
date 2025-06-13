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
  //  ipfsHash: String,                 // IPFS location of data
    hedera: {
      topicId: String
    },              // Hedera transaction ID
  },
  status: {
    type: String,
    enum: ['stored', 'archived', 'error'],
    default: 'stored'
  },
  patientIdHash: {
    type: String,
    required: true,
    index: true
  }
}, { timestamps: true });

// Keep timestamp index for sorting
healthRecordSchema.index({ 'metadata.timestamp': -1 });
// Add compound index for better query performance
healthRecordSchema.index({ patientIdHash: 1, 'metadata.timestamp': -1 });

// Add validation for IPFS hash format
// healthRecordSchema.path('storage.ipfsHash').validate(function(value) {
//   return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^b[A-Za-z2-7]{58}$/.test(value);
// }, 'Invalid IPFS hash format');

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
