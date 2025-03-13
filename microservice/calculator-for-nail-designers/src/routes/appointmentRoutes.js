const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Middleware para tratar erros
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Obter todos os agendamentos de um usuário
router.get('/:userId', asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ userId: req.params.userId }).sort({ date: 1 });
  res.json(appointments);
}));

// Obter estatísticas semanais
router.get('/stats/weekly/:userId', asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
  endOfWeek.setHours(23, 59, 59, 999);
  
  const appointments = await Appointment.find({
    userId: req.params.userId,
    date: { $gte: startOfWeek, $lte: endOfWeek },
    completed: true
  });
  
  const totalEarnings = appointments.reduce((sum, appointment) => sum + appointment.value, 0);
  const completedCount = appointments.length;
  
  res.json({
    totalEarnings,
    completedCount,
    startDate: startOfWeek,
    endDate: endOfWeek
  });
}));

// Obter estatísticas mensais
router.get('/stats/monthly/:userId', asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const appointments = await Appointment.find({
    userId: req.params.userId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
    completed: true
  });
  
  const totalEarnings = appointments.reduce((sum, appointment) => sum + appointment.value, 0);
  const completedCount = appointments.length;
  
  res.json({
    totalEarnings,
    completedCount,
    startDate: startOfMonth,
    endDate: endOfMonth
  });
}));

// Criar um novo agendamento
router.post('/', asyncHandler(async (req, res) => {
  const appointment = new Appointment({
    clientName: req.body.clientName,
    service: req.body.service,
    value: req.body.value,
    date: req.body.date,
    time: req.body.time,
    userId: req.body.userId,
    notes: req.body.notes
  });

  const newAppointment = await appointment.save();
  res.status(201).json(newAppointment);
}));

// Atualizar um agendamento
router.patch('/:id', asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({ message: 'Agendamento não encontrado' });
  }
  
  if (req.body.clientName) appointment.clientName = req.body.clientName;
  if (req.body.service) appointment.service = req.body.service;
  if (req.body.value) appointment.value = req.body.value;
  if (req.body.date) appointment.date = req.body.date;
  if (req.body.time) appointment.time = req.body.time;
  if (req.body.completed !== undefined) appointment.completed = req.body.completed;
  if (req.body.notes) appointment.notes = req.body.notes;
  
  const updatedAppointment = await appointment.save();
  res.json(updatedAppointment);
}));

// Excluir um agendamento
router.delete('/:id', asyncHandler(async (req, res) => {
  console.log('Recebida solicitação para excluir agendamento com ID:', req.params.id);
  
  // Verificar se estamos usando dados simulados
  if (global.usingMockData) {
    console.log('Usando dados simulados para exclusão');
    return res.json({ message: 'Agendamento excluído com sucesso' });
  }
  
  // Verificar se o ID é válido para MongoDB
  try {
    console.log('Tentando excluir do MongoDB');
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    
    await Appointment.findByIdAndDelete(req.params.id);
  } catch (err) {
    console.log('Erro ao excluir do MongoDB:', err.message);
    // Se o ID não for válido, retornar erro
    return res.status(400).json({ message: 'ID de agendamento inválido' });
  }
  
  res.json({ message: 'Agendamento excluído com sucesso' });
}));

// Middleware para tratamento de erros
router.use((err, req, res, next) => {
  console.error('Erro na rota de agendamentos:', err);
  res.status(500).json({ 
    message: 'Erro interno do servidor', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

module.exports = router; 