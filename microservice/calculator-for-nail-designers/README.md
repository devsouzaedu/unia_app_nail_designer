# Calculadora para Nail Designers - Microserviço

Este microserviço fornece uma API para gerenciar agendamentos e calcular ganhos para nail designers.

## Funcionalidades

- Gerenciamento de agendamentos de clientes
- Cálculo de ganhos semanais e mensais
- Marcação de procedimentos como concluídos
- Estatísticas de desempenho

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB
- Mongoose

## Configuração

1. Instale as dependências:
   ```
   npm install
   ```

2. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes variáveis:
     ```
     PORT=3001
     MONGODB_URI=mongodb://localhost:27017/nail-calculator
     ```

3. Inicie o servidor:
   ```
   npm run dev
   ```

## Endpoints da API

### Agendamentos

- `GET /api/appointments/:userId` - Obter todos os agendamentos de um usuário
- `POST /api/appointments` - Criar um novo agendamento
- `PATCH /api/appointments/:id` - Atualizar um agendamento
- `DELETE /api/appointments/:id` - Excluir um agendamento

### Estatísticas

- `GET /api/appointments/stats/weekly/:userId` - Obter estatísticas semanais
- `GET /api/appointments/stats/monthly/:userId` - Obter estatísticas mensais

## Modelo de Dados

### Agendamento (Appointment)

```javascript
{
  clientName: String,
  service: String,
  value: Number,
  date: Date,
  time: String,
  completed: Boolean,
  userId: String,
  notes: String,
  createdAt: Date
}
```

## Integração com o Frontend

Este microserviço é consumido pelo frontend da aplicação Unia, especificamente na página da calculadora para nail designers. 