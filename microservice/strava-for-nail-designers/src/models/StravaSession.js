const mongoose = require('mongoose');

// Verificar se estamos usando dados simulados
if (global.usingMockData) {
  console.log('[DEBUG] Usando modelo mock para StravaSession');
  
  // Criar um modelo simulado que não depende do MongoDB
  const mockModel = {
    find: async (query) => {
      console.log('[DEBUG] Mock find com query:', query);
      return global.mockStravaSessions.filter(session => {
        for (const key in query) {
          if (session[key] !== query[key]) return false;
        }
        return true;
      });
    },
    findById: async (id) => {
      console.log('[DEBUG] Mock findById:', id);
      return global.mockStravaSessions.find(session => session._id === id);
    },
    create: async (data) => {
      console.log('[DEBUG] Mock create com dados:', data);
      const newSession = {
        _id: 's' + Date.now().toString(),
        ...data
      };
      global.mockStravaSessions.push(newSession);
      return newSession;
    }
  };
  
  module.exports = mockModel;
} else {
  // Usar o modelo real do Mongoose quando não estiver no modo mock
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
} 