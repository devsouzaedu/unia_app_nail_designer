// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const stravaRoutes = require('./routes/stravaRoutes');
const { S3Client, HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3002;

// Configurar AWS S3
console.log('[DEBUG] Configurando AWS S3 com as seguintes credenciais:');
console.log('[DEBUG] - AWS_REGION:', process.env.AWS_REGION);
console.log('[DEBUG] - AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME);
console.log('[DEBUG] - AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '******' : 'não definido');
console.log('[DEBUG] - AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '******' : 'não definido');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'sa-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  endpoint: `https://s3.${process.env.AWS_REGION || 'sa-east-1'}.amazonaws.com`,
  forcePathStyle: false
});

// Configuração para dados simulados (mock)
global.usingMockData = process.env.USE_MOCK_DATA === 'true';
console.log('[DEBUG] Modo mock ativado:', global.usingMockData);

// Adicionar algumas sessões de exemplo para o modo de demonstração
if (global.usingMockData) {
  // Não criar sessões de demonstração automaticamente
  console.log('[DEBUG] Modo de demonstração ativado, mas sem sessões pré-criadas');
  
  // Apenas inicializar o array vazio
  global.mockStravaSessions = [];
}

// Criar pasta de uploads se não existir (para fallback local)
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Função para criar uma imagem de exemplo para a pasta de uploads
const createExampleImage = async (targetFilename) => {
  try {
    // Verificar se a imagem já existe no S3
    try {
      console.log(`[DEBUG] Verificando se o arquivo ${targetFilename} existe no S3 bucket ${process.env.AWS_S3_BUCKET_NAME}`);
      
      await s3Client.send(new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `uploads/${targetFilename}`
      }));
      
      console.log(`[DEBUG] Arquivo ${targetFilename} já existe no S3`);
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${targetFilename}`;
    } catch (error) {
      // Arquivo não existe, vamos criar
      console.log(`[DEBUG] Arquivo ${targetFilename} não existe no S3, criando...`);
      console.log(`[DEBUG] Erro ao verificar arquivo no S3: ${error.message}`);
      
      // Criar um arquivo de imagem simples
      const sampleImageContent = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      
      // Upload para o S3
      console.log(`[DEBUG] Enviando arquivo para o S3 bucket ${process.env.AWS_S3_BUCKET_NAME}`);
      
      try {
        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `uploads/${targetFilename}`,
          Body: sampleImageContent,
          ContentType: 'image/gif'
        }));
        
        const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${targetFilename}`;
        console.log(`[DEBUG] Imagem de exemplo criada no S3: ${imageUrl}`);
        return imageUrl;
      } catch (uploadError) {
        console.error(`[DEBUG] Erro ao fazer upload para S3: ${uploadError.message}`);
        throw uploadError;
      }
    }
  } catch (error) {
    console.error(`[DEBUG] Erro ao criar imagem no S3: ${error.message}`);
    console.error(`[DEBUG] Stack trace: ${error.stack}`);
    
    // Retornar URL de imagem de placeholder em caso de erro
    return `https://via.placeholder.com/150?text=Imagem+Indisponível`;
  }
};

// Configuração do Multer para upload de arquivos
// Usar memoryStorage para armazenar o arquivo em memória antes de enviar para o S3
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // limite de 5MB
  },
  fileFilter: function (req, file, cb) {
    // Adicionar logs para depuração
    console.log('[DEBUG] Arquivo recebido:', file);
    console.log('[DEBUG] Tipo do arquivo:', file.mimetype);
    console.log('[DEBUG] Nome original:', file.originalname);
    
    // Aceitar apenas imagens - verificando pelo mimetype também
    if (!file.mimetype.startsWith('image/') && !file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      console.log('[DEBUG] Arquivo rejeitado: não é uma imagem válida');
      return cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
    
    console.log('[DEBUG] Arquivo aceito');
    cb(null, true);
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Servir arquivos estáticos da pasta uploads com cabeçalhos CORS específicos (fallback)
app.use('/uploads', (req, res, next) => {
  // Adicionar cabeçalhos CORS específicos para imagens
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Conexão com o MongoDB (se não estiver usando dados simulados)
if (!global.usingMockData) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/strava-for-nails';
  
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));
} else {
  console.log('[DEBUG] Usando dados simulados (mock) - Não conectando ao MongoDB');
}

// Função para converter URLs relativas em absolutas
const getAbsoluteUrl = (req, relativeUrl) => {
  if (!relativeUrl) return null;
  
  // Se a URL já for absoluta, retorna ela mesma
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // Obter o host e protocolo da requisição
  const host = req.get('host');
  const protocol = req.protocol;
  
  // Se a URL começar com /uploads, adiciona apenas o host e protocolo
  if (relativeUrl.startsWith('/uploads/')) {
    return `${protocol}://${host}${relativeUrl}`;
  }
  
  // Se a URL não começar com /uploads, adiciona o host, protocolo e o caminho /uploads/
  if (!relativeUrl.includes('/uploads/')) {
    return `${protocol}://${host}/uploads/${relativeUrl.split('/').pop()}`;
  }
  
  return `${protocol}://${host}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
};

// Rota para upload de imagem
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    // Gerar um nome de arquivo único
    const fileKey = `uploads/${Date.now()}-${uuidv4()}${path.extname(req.file.originalname || '.jpg')}`;
    
    try {
      // Upload para o S3 usando o novo Upload do SDK v3
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        }
      });
      
      const result = await upload.done();
      
      // Retornar a URL da imagem
      const imageUrl = result.Location || `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      console.log('[DEBUG] Imagem enviada com sucesso para S3. URL:', imageUrl);
      res.json({ imageUrl });
    } catch (s3Error) {
      console.error('[DEBUG] Erro no upload para S3:', s3Error);
      
      // Em caso de erro, retornar uma mensagem de erro
      return res.status(500).json({ 
        message: 'Erro ao fazer upload da imagem para o S3', 
        error: s3Error.message 
      });
    }
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload da imagem' });
  }
});

// Rota para obter todas as sessões de um usuário
app.get('/api/strava/:userId', (req, res, next) => {
  console.log('[DEBUG] Recebida requisição GET para /api/strava/:userId');
  console.log('[DEBUG] ID do usuário:', req.params.userId);
  console.log('[DEBUG] Modo mock ativado:', global.usingMockData);
  console.log('[DEBUG] Total de sessões em memória:', global.mockStravaSessions.length);
  
  if (global.usingMockData) {
    const userSessions = global.mockStravaSessions.filter(
      session => session.userId === req.params.userId
    );
    
    console.log('[DEBUG] Sessões encontradas para o usuário:', userSessions.length);
    
    // Verificar se há sessões com o nome "Thaly"
    const thalySession = userSessions.find(session => 
      session.clientName && session.clientName.includes('Thaly')
    );
    console.log('[DEBUG] Sessão com nome Thaly encontrada:', thalySession ? 'Sim' : 'Não');
    if (thalySession) {
      console.log('[DEBUG] Detalhes da sessão Thaly:', JSON.stringify(thalySession));
    }
    
    // Converter URLs relativas em absolutas
    const sessionsWithAbsoluteUrls = userSessions.map(session => {
      const updatedSession = {
        ...session,
        beforePhoto: getAbsoluteUrl(req, session.beforePhoto),
        afterPhoto: getAbsoluteUrl(req, session.afterPhoto),
        progressPhotos: (session.progressPhotos || []).map(photo => 
          getAbsoluteUrl(req, photo)
        )
      };
      
      console.log('[DEBUG] Sessão processada:');
      console.log('[DEBUG] - ID:', updatedSession._id);
      console.log('[DEBUG] - Cliente:', updatedSession.clientName);
      console.log('[DEBUG] - Foto antes:', updatedSession.beforePhoto);
      console.log('[DEBUG] - Foto depois:', updatedSession.afterPhoto);
      
      return updatedSession;
    });
    
    console.log('[DEBUG] Retornando sessões com URLs absolutas');
    return res.json(sessionsWithAbsoluteUrls);
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
  console.log('[DEBUG] Recebida requisição POST para /api/strava/start');
  console.log('[DEBUG] Corpo da requisição:', JSON.stringify(req.body));
  console.log('[DEBUG] Modo mock ativado:', global.usingMockData);
  
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
    console.log('[DEBUG] Nova sessão strava iniciada:', JSON.stringify(newSession));
    console.log('[DEBUG] Total de sessões em memória:', global.mockStravaSessions.length);
    
    return res.status(201).json(newSession);
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

app.patch('/api/strava/finish/:id', (req, res, next) => {
  if (global.usingMockData) {
    console.log('[DEBUG] Recebida requisição PATCH para /api/strava/finish/:id');
    console.log('[DEBUG] ID da sessão:', req.params.id);
    console.log('[DEBUG] Corpo da requisição:', JSON.stringify(req.body));
    
    const index = global.mockStravaSessions.findIndex(session => session._id === req.params.id);
    
    if (index === -1) {
      console.log('[DEBUG] Sessão não encontrada');
      return res.status(404).json({ message: 'Sessão não encontrada' });
    }
    
    console.log('[DEBUG] Sessão encontrada, atualizando...');
    console.log('[DEBUG] Sessão antes da atualização:', JSON.stringify(global.mockStravaSessions[index]));
    
    const endTime = new Date();
    const startTime = new Date(global.mockStravaSessions[index].startTime);
    const durationInSeconds = Math.floor((endTime - startTime) / 1000);
    
    global.mockStravaSessions[index].endTime = endTime;
    global.mockStravaSessions[index].duration = durationInSeconds;
    global.mockStravaSessions[index].afterPhoto = req.body.afterPhoto;
    global.mockStravaSessions[index].notes = req.body.notes || global.mockStravaSessions[index].notes;
    global.mockStravaSessions[index].completed = true;
    
    console.log('[DEBUG] Sessão atualizada com sucesso');
    console.log('[DEBUG] Sessão após atualização:', JSON.stringify(global.mockStravaSessions[index]));
    console.log('[DEBUG] Total de sessões em memória:', global.mockStravaSessions.length);
    
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

// Usar as rotas do Strava
app.use('/api/strava', stravaRoutes);

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'strava-for-nail-designers' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor Strava for Nail Designers rodando na porta ${PORT}`);
}); 