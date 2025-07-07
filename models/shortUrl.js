const mongoose = require('mongoose');

const cacheSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  curl: {
    type: String,
    required: true
  },
  shortId: {
    type: String,
    required: true,
    unique: true
  },
  updateMethod: {
    type: String,
    enum: ['manual', 'auto'],
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Cache', cacheSchema);
