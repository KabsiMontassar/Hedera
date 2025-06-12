const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  hederaAccountId: {
    type: String,
    default: null
  },
  completedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BadgeClaim'
  }],
  nftWallet: {
    hederaAccountId: String,
    publicKey: String
  },
  healthRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthRecord'
  }]
}, { timestamps: true });

// Add method to check if user has earned a specific badge
userSchema.methods.hasEarnedBadge = async function(badgeId) {
  const BadgeClaim = mongoose.model('BadgeClaim');
  const claim = await BadgeClaim.findOne({
    userId: this._id,
    badgeId: badgeId
  });
  return !!claim;
};

// Add method to check if user has claimed a specific badge as NFT
userSchema.methods.hasClaimedBadge = async function(badgeId) {
  const BadgeClaim = mongoose.model('BadgeClaim');
  const claim = await BadgeClaim.findOne({
    userId: this._id,
    badgeId: badgeId,
    status: 'CLAIMED'
  });
  return !!claim;
};

module.exports = mongoose.model('User', userSchema);
