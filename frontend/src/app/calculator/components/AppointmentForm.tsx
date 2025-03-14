"use client";

import { useState, FormEvent } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';

interface AppointmentFormProps {
  userId: string;
  onAppointmentAdded: () => void;
}

export default function AppointmentForm({ userId, onAppointmentAdded }: AppointmentFormProps) {
  const [clientName, setClientName] = useState('');
  const [service, setService] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validações básicas
      if (!clientName.trim()) throw new Error('Nome da cliente é obrigatório');
      if (!service.trim()) throw new Error('Serviço é obrigatório');
      if (!value || parseFloat(value) <= 0) throw new Error('Valor deve ser maior que zero');
      if (!date) throw new Error('Data é obrigatória');
      if (!time) throw new Error('Horário é obrigatório');

      const appointmentData = {
        clientName,
        service,
        value: parseFloat(value),
        date: new Date(`${date}T${time}`),
        time,
        userId,
        notes
      };

      // Tentar até 3 vezes em caso de falha na conexão
      let retries = 0;
      const maxRetries = 3;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          await axios.post('https://calculator-for-nail-designers.onrender.com/api/appointments', appointmentData);
          success = true;
        } catch (err) {
          retries++;
          if (retries >= maxRetries) throw err;
          // Esperar um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Limpar o formulário
      setClientName('');
      setService('');
      setValue('');
      setDate('');
      setTime('');
      setNotes('');
      
      setSuccess('Agendamento adicionado com sucesso!');
      onAppointmentAdded();
    } catch (err: any) {
      console.error('Erro ao adicionar agendamento:', err);
      setError(err.message || 'Erro ao adicionar agendamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="appointment-form">
      <h2>Adicionar Novo Agendamento</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="clientName">Nome da Cliente:</label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="service">Serviço:</label>
          <input
            type="text"
            id="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="value">Valor (R$):</label>
          <input
            type="number"
            id="value"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Data:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="time">Horário:</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Observações:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Adicionando...' : 'Adicionar Agendamento'}
        </button>
      </form>
      
      <style jsx>{`
        .appointment-form {
          background-color: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        
        h2 {
          color: #e62e69;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }
        
        input, textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
        }
        
        textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        button {
          background-color: #e62e69;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
          font-family: 'Inter', sans-serif;
        }
        
        button:hover {
          background-color: #d0225e;
        }
        
        button:disabled {
          background-color: #f5a5c0;
          cursor: not-allowed;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .success-message {
          background-color: #e8f5e9;
          color: #2e7d32;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
} 