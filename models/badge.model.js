const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  metadata: {
    name: String,
    description: String,
    image: String,
    properties: {
      completionDate: Date,
      difficulty: String,
      issuer: String
    }
  },
  transactionId: String,
  mintedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
