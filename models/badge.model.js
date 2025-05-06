const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  image: String,
  criteria: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Achievement', 'Skill', 'Certification'],
    default: 'Achievement'
  },
  metadata: {
    symbol: String,
    properties: {
      difficulty: String,
      issuer: String,
      skills: [String]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
