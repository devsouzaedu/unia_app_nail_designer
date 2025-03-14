require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');
const stravaRoutes = require('./routes/stravaRoutes');

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
// Array para armazenar agendamentos simulados
global.mockAppointments = [
  {
    _id: '1',
    clientName: 'Maria Silva',
    service: 'Nail Art Completa',
    value: 150.00,
    date: new Date(),
    time: '14:00',
    completed: true,
    userId: 'demo-user@example.com',
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
    userId: 'demo-user@example.com',
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
    userId: 'demo-user@example.com'
  }
];

// Array para armazenar sessões de strava simuladas
global.mockStravaSessions = [
  {
    _id: 's1',
    clientName: 'Fernanda Souza',
    value: 180.00,
    startTime: new Date(new Date().setDate(new Date().getDate() - 2)),
    endTime: new Date(new Date().setDate(new Date().getDate() - 2) + 7200000), // +2 horas
    duration: 7200, // 2 horas em segundos
    beforePhoto: 'https://example.com/photos/before1.jpg',
    afterPhoto: 'https://example.com/photos/after1.jpg',
    progressPhotos: [
      'https://example.com/photos/progress1.jpg',
      'https://example.com/photos/progress2.jpg'
    ],
    notes: 'Cliente gostou muito do resultado',
    userId: 'demo-user@example.com',
    completed: true
  },
  {
    _id: 's2',
    clientName: 'Camila Mendes',
    value: 220.00,
    startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    endTime: new Date(new Date().setDate(new Date().getDate() - 1) + 9000000), // +2.5 horas
    duration: 9000, // 2.5 horas em segundos
    beforePhoto: 'https://example.com/photos/before2.jpg',
    afterPhoto: 'https://example.com/photos/after2.jpg',
    progressPhotos: [
      'https://example.com/photos/progress3.jpg'
    ],
    notes: 'Aplicação de unhas em gel',
    userId: 'demo-user@example.com',
    completed: true
  }
];

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

// Função para calcular estatísticas com base nos agendamentos simulados
function calculateMockStats(userId, period) {
  const now = new Date();
  let startDate, endDate;
  
  if (period === 'weekly') {
    // Início da semana (domingo)
    startDate = new Date(now.setDate(now.getDate() - now.getDay()));
    startDate.setHours(0, 0, 0, 0);
    
    // Fim da semana (sábado)
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'monthly') {
    // Início do mês
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Fim do mês
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }
  
  // Filtrar agendamentos pelo período e usuário
  const filteredAppointments = global.mockAppointments.filter(app => {
    const appDate = new Date(app.date);
    return app.userId === userId && 
           appDate >= startDate && 
           appDate <= endDate;
  });
  
  // Calcular estatísticas
  const completedAppointments = filteredAppointments.filter(app => app.completed);
  const totalEarnings = filteredAppointments.reduce((sum, app) => sum + app.value, 0);
  
  console.log('MCP: Calculando estatísticas para', userId, period);
  console.log('MCP: Estatísticas calculadas', { totalEarnings, completedCount: completedAppointments.length });
  
  return {
    totalEarnings,
    completedCount: completedAppointments.length,
    startDate,
    endDate
  };
}

// Rotas específicas para dados simulados
app.get('/api/appointments/stats/weekly/:userId', (req, res, next) => {
  if (global.usingMockData) {
    const stats = calculateMockStats(req.params.userId, 'weekly');
    return res.json(stats);
  }
  next();
});

app.get('/api/appointments/stats/monthly/:userId', (req, res, next) => {
  if (global.usingMockData) {
    const stats = calculateMockStats(req.params.userId, 'monthly');
    return res.json(stats);
  }
  next();
});

// Middleware para simular dados quando não há conexão com o banco
app.use('/api/appointments/:userId', (req, res, next) => {
  if (global.usingMockData && req.method === 'GET') {
    // Filtrar agendamentos pelo userId
    const userAppointments = global.mockAppointments.filter(app => 
      app.userId === req.params.userId
    );
    return res.json(userAppointments);
  }
  next();
});

// Rota específica para exclusão de agendamentos em modo simulado
app.delete('/api/appointments/:id', (req, res, next) => {
  if (global.usingMockData) {
    console.log('Recebida solicitação DELETE para ID:', req.params.id);
    
    // Encontrar e remover o agendamento
    const index = global.mockAppointments.findIndex(app => app._id === req.params.id);
    if (index !== -1) {
      global.mockAppointments.splice(index, 1);
      return res.json({ message: 'Agendamento excluído com sucesso' });
    }
    
    return res.status(404).json({ message: 'Agendamento não encontrado' });
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
    const newAppointment = {
      _id: Date.now().toString(),
      ...req.body,
      createdAt: new Date()
    };
    
    // Adicionar ao array de agendamentos simulados
    global.mockAppointments.push(newAppointment);
    
    console.log('MCP: Novo agendamento adicionado', newAppointment);
    console.log('MCP: Total de agendamentos', global.mockAppointments.length);
    
    return res.status(201).json(newAppointment);
  } else if (req.method === 'PATCH' && req.path.startsWith('/')) {
    // Extrair o ID da URL
    const id = req.path.substring(1);
    console.log('Simulando atualização para ID:', id);
    
    // Encontrar e atualizar o agendamento
    const index = global.mockAppointments.findIndex(app => app._id === id);
    if (index !== -1) {
      global.mockAppointments[index] = {
        ...global.mockAppointments[index],
        ...req.body,
        updatedAt: new Date()
      };
      return res.json(global.mockAppointments[index]);
    }
    
    return res.status(404).json({ message: 'Agendamento não encontrado' });
  } else if (req.method === 'DELETE' && req.path.startsWith('/')) {
    // Extrair o ID da URL
    const id = req.path.substring(1);
    console.log('Simulando exclusão para ID:', id);
    
    // Encontrar e remover o agendamento
    const index = global.mockAppointments.findIndex(app => app._id === id);
    if (index !== -1) {
      global.mockAppointments.splice(index, 1);
      return res.json({ message: 'Agendamento excluído com sucesso' });
    }
    
    return res.status(404).json({ message: 'Agendamento não encontrado' });
  }
  
  next();
});

// Rotas para Strava em modo simulado
app.get('/api/strava/:userId', (req, res, next) => {
  if (global.usingMockData) {
    // Filtrar sessões pelo userId
    const userSessions = global.mockStravaSessions.filter(session => 
      session.userId === req.params.userId
    );
    return res.json(userSessions);
  }
  next();
});

app.get('/api/strava/session/:id', (req, res, next) => {
  if (global.usingMockData) {
    const session = global.mockStravaSessions.find(session => session._id === req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Sessão não encontrada' });
    }
    
    return res.json(session);
  }
  next();
});

app.post('/api/strava/start', (req, res, next) => {
  if (global.usingMockData) {
    const newSession = {
      _id: 's' + Date.now().toString(),
      clientName: req.body.clientName,
      value: req.body.value,
      beforePhoto: req.body.beforePhoto,
      userId: req.body.userId,
      startTime: new Date(),
      notes: req.body.notes || '',
      progressPhotos: [],
      completed: false
    };
    
    global.mockStravaSessions.push(newSession);
    console.log('MCP: Nova sessão strava iniciada', newSession);
    
    return res.status(201).json(newSession);
  }
  next();
});

app.patch('/api/strava/notes/:id', (req, res, next) => {
  if (global.usingMockData) {
    const index = global.mockStravaSessions.findIndex(session => session._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Sessão não encontrada' });
    }
    
    global.mockStravaSessions[index].notes = req.body.notes;
    return res.json(global.mockStravaSessions[index]);
  }
  next();
});

app.patch('/api/strava/add-photo/:id', (req, res, next) => {
  if (global.usingMockData) {
    const index = global.mockStravaSessions.findIndex(session => session._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Sessão não encontrada' });
    }
    
    global.mockStravaSessions[index].progressPhotos.push(req.body.photoUrl);
    return res.json(global.mockStravaSessions[index]);
  }
  next();
});

app.patch('/api/strava/finish/:id', (req, res, next) => {
  if (global.usingMockData) {
    const index = global.mockStravaSessions.findIndex(session => session._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Sessão não encontrada' });
    }
    
    const endTime = new Date();
    const startTime = new Date(global.mockStravaSessions[index].startTime);
    const durationInSeconds = Math.floor((endTime - startTime) / 1000);
    
    global.mockStravaSessions[index].endTime = endTime;
    global.mockStravaSessions[index].duration = durationInSeconds;
    global.mockStravaSessions[index].afterPhoto = req.body.afterPhoto;
    global.mockStravaSessions[index].completed = true;
    
    return res.json(global.mockStravaSessions[index]);
  }
  next();
});

app.delete('/api/strava/:id', (req, res, next) => {
  if (global.usingMockData) {
    const index = global.mockStravaSessions.findIndex(session => session._id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Sessão não encontrada' });
    }
    
    global.mockStravaSessions.splice(index, 1);
    return res.json({ message: 'Sessão excluída com sucesso' });
  }
  next();
});

// Rotas da API
app.use('/api/appointments', appointmentRoutes);
app.use('/api/strava', stravaRoutes); 