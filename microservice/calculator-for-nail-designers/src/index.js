require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Opções de conexão do MongoDB
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4  // Forçar IPv4
};

// Variável para controlar se estamos usando dados simulados
global.usingMockData = false;

// Função para iniciar o servidor
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}${global.usingMockData ? ' (usando dados simulados)' : ''}`);
  });
};

// Conectar ao MongoDB
console.log('Tentando conectar ao MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log('Conectado ao MongoDB Atlas com sucesso');
    startServer();
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB Atlas:', err.message);
    console.log('Tentando conexão alternativa com MongoDB local...');
    
    // Tentar conexão alternativa com MongoDB local
    mongoose.connect('mongodb://127.0.0.1:27017/nail-calculator', mongoOptions)
      .then(() => {
        console.log('Conectado ao MongoDB local com sucesso');
        startServer();
      })
      .catch(err => {
        console.error('Falha na conexão alternativa:', err.message);
        console.log('Iniciando servidor com dados simulados...');
        
        // Configurar para usar dados simulados
        global.usingMockData = true;
        
        // Iniciar o servidor com dados simulados
        startServer();
      });
  });

// Rota de teste
app.get('/', (req, res) => {
  res.send(`API da Calculadora para Nail Designers está funcionando! ${global.usingMockData ? '(Usando dados simulados)' : ''}`);
});

// Rotas específicas para dados simulados
app.get('/api/appointments/stats/weekly/:userId', (req, res, next) => {
  if (global.usingMockData) {
    return res.json({
      totalEarnings: 750.00,
      completedCount: 5,
      startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
      endDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6))
    });
  }
  next();
});

app.get('/api/appointments/stats/monthly/:userId', (req, res, next) => {
  if (global.usingMockData) {
    return res.json({
      totalEarnings: 3200.00,
      completedCount: 22,
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    });
  }
  next();
});

// Middleware para simular dados quando não há conexão com o banco
app.use('/api/appointments/:userId', (req, res, next) => {
  if (global.usingMockData && req.method === 'GET') {
    // Lista de agendamentos simulados
    return res.json([
      {
        _id: '1',
        clientName: 'Maria Silva',
        service: 'Nail Art Completa',
        value: 150.00,
        date: new Date(),
        time: '14:00',
        completed: true,
        userId: req.params.userId,
        notes: 'Cliente regular'
      },
      {
        _id: '2',
        clientName: 'Ana Oliveira',
        service: 'Manicure Simples',
        value: 80.00,
        date: new Date(new Date().setDate(new Date().getDate() + 1)),
        time: '10:00',
        completed: false,
        userId: req.params.userId,
        notes: 'Primeira visita'
      },
      {
        _id: '3',
        clientName: 'Juliana Costa',
        service: 'Alongamento de Unhas',
        value: 200.00,
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        time: '16:30',
        completed: false,
        userId: req.params.userId
      }
    ]);
  }
  next();
});

// Rota específica para exclusão de agendamentos em modo simulado
app.delete('/api/appointments/:id', (req, res, next) => {
  if (global.usingMockData) {
    console.log('Recebida solicitação DELETE para ID:', req.params.id);
    return res.json({ message: 'Agendamento excluído com sucesso (simulado)' });
  }
  next();
});

// Middleware para simular criação, atualização e exclusão
app.use('/api/appointments', (req, res, next) => {
  if (!global.usingMockData) {
    return next();
  }
  
  if (req.method === 'POST') {
    // Simular criação de agendamento
    return res.status(201).json({
      _id: Date.now().toString(),
      ...req.body,
      createdAt: new Date()
    });
  } else if (req.method === 'PATCH' && req.path.startsWith('/')) {
    // Extrair o ID da URL
    const id = req.path.substring(1);
    console.log('Simulando atualização para ID:', id);
    // Simular atualização de agendamento
    return res.json({
      _id: id,
      ...req.body,
      updatedAt: new Date()
    });
  } else if (req.method === 'DELETE' && req.path.startsWith('/')) {
    // Extrair o ID da URL
    const id = req.path.substring(1);
    console.log('Simulando exclusão para ID:', id);
    // Simular exclusão de agendamento
    return res.json({ message: 'Agendamento excluído com sucesso' });
  }
  
  next();
});

// Rotas da API
app.use('/api/appointments', appointmentRoutes); 