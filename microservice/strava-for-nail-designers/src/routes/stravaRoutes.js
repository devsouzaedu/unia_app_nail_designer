const express = require('express');
const router = express.Router();
const StravaSession = require('../models/StravaSession');

// Middleware para tratar erros
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware para verificar se está usando mock data
const checkMockData = (req, res, next) => {
  if (global.usingMockData) {
    console.log('[DEBUG] Rota acessada em modo mock, pulando para o próximo middleware');
    return next('route');
  }
  next();
};

// Aplicar o middleware de verificação de mock em todas as rotas
router.use(checkMockData);

// Obter todas as sessões de um usuário
router.get('/:userId', asyncHandler(async (req, res) => {
  console.log('[DEBUG] Buscando sessões do usuário no MongoDB:', req.params.userId);
  const sessions = await StravaSession.find({ userId: req.params.userId }).sort({ startTime: -1 });
  res.json(sessions);
}));

// Obter uma sessão específica
router.get('/session/:id', asyncHandler(async (req, res) => {
  console.log('[DEBUG] Buscando sessão específica no MongoDB:', req.params.id);
  const session = await StravaSession.findById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Sessão não encontrada' });
  }
  
  res.json(session);
}));

// Iniciar uma nova sessão
router.post('/start', asyncHandler(async (req, res) => {
  console.log('[DEBUG] Criando nova sessão no MongoDB com dados:', req.body);
  
  const sessionData = {
    clientName: req.body.clientName,
    value: req.body.value,
    beforePhoto: req.body.beforePhoto,
    userId: req.body.userId,
    startTime: new Date(),
    notes: req.body.notes || ''
  };

  const newSession = await StravaSession.create(sessionData);
  res.status(201).json(newSession);
}));

// Adicionar foto durante o processo
router.patch('/add-photo/:id', asyncHandler(async (req, res) => {
  const session = await StravaSession.findById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Sessão não encontrada' });
  }
  
  session.progressPhotos.push(req.body.photoUrl);
  const updatedSession = await session.save();
  res.json(updatedSession);
}));

// Atualizar notas
router.patch('/notes/:id', asyncHandler(async (req, res) => {
  const session = await StravaSession.findById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Sessão não encontrada' });
  }
  
  session.notes = req.body.notes;
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
  const session = await StravaSession.findById(req.params.id);
  
  if (!session) {
    return res.status(404).json({ message: 'Sessão não encontrada' });
  }
  
  await session.remove();
  res.json({ message: 'Sessão excluída com sucesso' });
}));

module.exports = router; 