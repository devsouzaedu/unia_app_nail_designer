# Strava for Nail Designers - Backend

Este é o backend para o aplicativo Strava for Nail Designers, que permite que profissionais de nail design registrem seus atendimentos, acompanhem o tempo e documentem o processo com fotos.

## Funcionalidades

- Registro de atendimentos com informações do cliente e valor
- Cronometragem do tempo de atendimento
- Upload de fotos antes, durante e depois do atendimento
- Registro de notas sobre o atendimento
- Histórico de atendimentos

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB (Mongoose)
- Multer (para upload de arquivos)
- RESTful API

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env.local`
4. Inicie o servidor:
   ```
   npm run dev
   ```

## Endpoints da API

### Upload de Imagens

- `POST /api/upload` - Fazer upload de uma imagem (retorna a URL da imagem)

### Sessões de Atendimento

- `GET /api/strava/:userId` - Obter todas as sessões de um usuário
- `GET /api/strava/session/:id` - Obter uma sessão específica
- `POST /api/strava/start` - Iniciar uma nova sessão
- `PATCH /api/strava/add-photo/:id` - Adicionar foto durante o processo
- `PATCH /api/strava/notes/:id` - Atualizar notas
- `PATCH /api/strava/finish/:id` - Finalizar uma sessão
- `DELETE /api/strava/:id` - Excluir uma sessão

## Modo de Simulação (Mock)

O servidor pode ser executado em modo de simulação, sem necessidade de um banco de dados MongoDB. Para ativar este modo, defina a variável de ambiente `USE_MOCK_DATA=true`.

## Armazenamento de Imagens

As imagens enviadas são armazenadas na pasta `uploads` e são servidas como arquivos estáticos pelo servidor. Em um ambiente de produção, recomenda-se utilizar um serviço de armazenamento em nuvem como Amazon S3, Google Cloud Storage ou Azure Blob Storage.