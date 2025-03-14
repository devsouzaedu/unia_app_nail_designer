const express = require('express');
const router = express.Router();
const StravaSession = require('../models/StravaSession');

// Middleware para tratar erros
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Obter todas as sessões de um usuário
router.get('/:userId', asyncHandler(async (req, res) => {
  const sessions = await StravaSession.find({ userId: req.params.userId }).sort({ startTime: -1 });
  res.json(sessions);
}));

// Obter uma sessão específica
router.get('/session/:id', asyncHandler(async (req, res) => {
  const session = await StravaSession.findById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Sessão não encontrada' });
  }
  
  res.json(session);
}));

// Iniciar uma nova sessão
router.post('/start', asyncHandler(async (req, res) => {
  const session = new StravaSession({
    clientName: req.body.clientName,
    value: req.body.value,
    beforePhoto: req.body.beforePhoto,
    userId: req.body.userId,
    startTime: new Date(),
    notes: req.body.notes || ''
  });

  const newSession = await session.save();
  res.status(201).json(newSession);
}));

// Atualizar notas durante a sessão
router.patch('/notes/:id', asyncHandler(async (req, res) => {
  const session = await StravaSession.findById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Sessão não encontrada' });
  }
  
  session.notes = req.body.notes;
  const updatedSession = await session.save();
  res.json(updatedSession);
}));

// Adicionar foto durante a sessão
router.patch('/add-photo/:id', asyncHandler(async (req, res) => {
  const session = await StravaSession.findById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Sessão não encontrada' });
  }
  
  session.progressPhotos.push(req.body.photoUrl);
  const updatedSession = await session.save();
  res.json(updatedSession);
}));

// Finalizar uma sessão
router.patch('/finish/:id', asyncHandler(async (req, res) => {
  const session = await StravaSession.findById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Sessão não encontrada' });
  }
  
  const endTime = new Date();
  const startTime = new Date(session.startTime);
  const durationInSeconds = Math.floor((endTime - startTime) / 1000);
  
  session.endTime = endTime;
  session.duration = durationInSeconds;
  session.afterPhoto = req.body.afterPhoto;
  session.completed = true;
  
  const updatedSession = await session.save();
  res.json(updatedSession);
}));

// Excluir uma sessão
router.delete('/:id', asyncHandler(async (req, res) => {
  console.log('Recebida solicitação para excluir sessão com ID:', req.params.id);
  
  // Verificar se estamos usando dados simulados
  if (global.usingMockData) {
    console.log('Usando dados simulados para exclusão');
    return res.json({ message: 'Sessão excluída com sucesso' });
  }
  
  try {
    const session = await StravaSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Sessão não encontrada' });
    }
    
    await StravaSession.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.log('Erro ao excluir do MongoDB:', err.message);
    return res.status(400).json({ message: 'ID de sessão inválido' });
  }
  
  res.json({ message: 'Sessão excluída com sucesso' });
}));

// Middleware para tratamento de erros
router.use((err, req, res, next) => {
  console.error('Erro na rota de strava:', err);
  res.status(500).json({ 
    message: 'Erro interno do servidor', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

module.exports = router; 