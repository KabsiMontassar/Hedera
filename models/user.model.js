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
    ref: 'Badge'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
