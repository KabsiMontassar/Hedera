const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    unique: true
  },
  patientIdHash: {
    type: String,
    required: true,
    index: true
  },
  metadata: {
    timestamp: Date,
    version: String,
    lastModified: Date
  },
  storage: {
    encryptedData: String,
    iv: String,
    authTag: String,
    encryptionKeyReference: String,
    ipfsHash: String,
    hederaFileId: String
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'encrypted', 'stored'],
    default: 'pending'
  }
}, { timestamps: true });

// Add index for efficient queries
healthRecordSchema.index({ 'metadata.timestamp': -1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
