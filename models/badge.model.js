const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  criteria: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tokenId: {
    type: String,


  },
  badgeId: {
    type: String,
    unique: true,
    default: function () {
      return `badge-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  tokenReference: {
    type: String,
    default: function () {
      return `token-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  },
  metadata: {
    optimizedForHedera: {
      name: String,
      description: String,
      imageUrl: String,
      properties: {
        completionDate: Date,
        difficulty: String,
        issuer: String
      }
    },
    fullMetadata: {
      name: String,
      description: String,
      imageUrl: String,
      properties: {
        completionDate: Date,
        difficulty: String,
        issuer: String
      }
    }
  }
}, { timestamps: true });

// Add pre-save middleware to validate transactionId
badgeSchema.pre('save', function (next) {
  if (!this.transactionId) {
    next(new Error('Transaction ID is required'));
  }
  next();
});

// Add an index on userId and courseId to enforce one badge per course per user
badgeSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Badge', badgeSchema);
