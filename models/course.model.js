const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  badgeMetadata: {
    name: String,
    symbol: String,
    description: String,
    imageUrl: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
