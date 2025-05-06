const mongoose = require('mongoose');

const badgeClaimSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  status: {
    type: String,
    enum: ['EARNED', 'CLAIMED'],
    default: 'EARNED'
  },
  nftDetails: {
    tokenId: String,
    serialNumber: Number,
    transactionId: String,
    mintedAt: Date
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  claimedAt: Date
}, { timestamps: true });

// Compound index to ensure a user can only claim a badge once
badgeClaimSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Method to check if badge can be claimed
badgeClaimSchema.methods.canClaim = function() {
  return this.status === 'EARNED';
};

// Method to mark badge as claimed
badgeClaimSchema.methods.markClaimed = function(nftDetails) {
  this.status = 'CLAIMED';
  this.nftDetails = nftDetails;
  this.claimedAt = new Date();
};

module.exports = mongoose.model('BadgeClaim', badgeClaimSchema);
