const mongoose = require('mongoose');

const stravaSessionSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // duração em segundos
  },
  beforePhoto: {
    type: String, // URL ou caminho da foto antes
    required: true
  },
  afterPhoto: {
    type: String // URL ou caminho da foto depois
  },
  progressPhotos: [{
    type: String // URLs ou caminhos das fotos durante o processo
  }],
  notes: {
    type: String,
    trim: true
  },
  userId: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StravaSession', stravaSessionSchema); 