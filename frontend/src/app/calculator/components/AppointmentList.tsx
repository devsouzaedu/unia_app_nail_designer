"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { FaCheck, FaTrash, FaEdit, FaSync } from 'react-icons/fa';

interface Appointment {
  _id: string;
  clientName: string;
  service: string;
  value: number;
  date: string;
  time: string;
  completed: boolean;
  notes?: string;
}

interface AppointmentListProps {
  userId: string;
  refreshTrigger: number;
  onAppointmentUpdated: () => void;
}

export default function AppointmentList({ userId, refreshTrigger, onAppointmentUpdated }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [userId, refreshTrigger]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Tentar até 3 vezes em caso de falha na conexão
      let retries = 0;
      const maxRetries = 3;
      let success = false;
      let response;

      while (retries < maxRetries && !success) {
        try {
          response = await axios.get(`http://localhost:3001/api/appointments/${userId}`);
          success = true;
        } catch (err) {
          retries++;
          if (retries >= maxRetries) throw err;
          // Esperar um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (response && response.data) {
        setAppointments(response.data);
      }
      setError('');
    } catch (err: any) {
      console.error('Erro ao buscar agendamentos:', err);
      setError('Erro ao carregar agendamentos. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  const markAsCompleted = async (id: string) => {
    try {
      await axios.patch(`http://localhost:3001/api/appointments/${id}`, {
        completed: true
      });
      
      // Atualizar a lista localmente
      setAppointments(appointments.map(appointment => 
        appointment._id === id ? { ...appointment, completed: true } : appointment
      ));
      
      onAppointmentUpdated();
    } catch (err: any) {
      console.error('Erro ao marcar como concluído:', err);
      setError('Erro ao atualizar o agendamento. Tente novamente.');
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }
    
    try {
      console.log('Tentando excluir agendamento com ID:', id);
      
      // Tentar até 3 vezes em caso de falha na conexão
      let retries = 0;
      const maxRetries = 3;
      let success = false;
      
      while (retries < maxRetries && !success) {
        try {
          // Usando o endpoint correto para exclusão
          const response = await axios.delete(`http://localhost:3001/api/appointments/${id}`);
          console.log('Resposta da exclusão:', response.data);
          success = true;
        } catch (err) {
          console.error('Tentativa falhou:', err);
          retries++;
          if (retries >= maxRetries) throw err;
          // Esperar um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Remover da lista localmente
      setAppointments(appointments.filter(appointment => appointment._id !== id));
      
      onAppointmentUpdated();
    } catch (err: any) {
      console.error('Erro ao excluir agendamento:', err.response?.data || err.message);
      
      // Se o erro for de conexão ou o servidor não estiver disponível, remover localmente mesmo assim
      if (err.code === 'ECONNREFUSED' || err.response?.status === 503) {
        console.log('Servidor indisponível, removendo localmente apenas');
        setAppointments(appointments.filter(appointment => appointment._id !== id));
        onAppointmentUpdated();
        setError('Servidor indisponível. O agendamento foi removido apenas localmente.');
      } else {
        setError(`Erro ao excluir o agendamento: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    fetchAppointments();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (err) {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return <div className="loading">Carregando agendamentos...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={handleRetry} disabled={isRetrying}>
          {isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}
          {!isRetrying && <FaSync className="retry-icon" />}
        </button>
      </div>
    );
  }

  if (appointments.length === 0) {
    return <div className="no-appointments">Nenhum agendamento encontrado.</div>;
  }

  return (
    <div className="appointment-list">
      <h2>Seus Agendamentos</h2>
      
      <div className="appointments">
        {appointments.map((appointment) => (
          <div 
            key={appointment._id} 
            className={`appointment-card ${appointment.completed ? 'completed' : ''}`}
          >
            <div className="appointment-header">
              <h3>{appointment.clientName}</h3>
              <div className="appointment-actions">
                {!appointment.completed && (
                  <button 
                    className="action-button complete"
                    onClick={() => markAsCompleted(appointment._id)}
                    title="Marcar como concluído"
                  >
                    <FaCheck />
                  </button>
                )}
                <button 
                  className="action-button delete"
                  onClick={() => deleteAppointment(appointment._id)}
                  title="Excluir agendamento"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div className="appointment-details">
              <p><strong>Serviço:</strong> {appointment.service}</p>
              <p><strong>Valor:</strong> R$ {appointment.value.toFixed(2)}</p>
              <p><strong>Data:</strong> {formatDate(appointment.date)}</p>
              <p><strong>Horário:</strong> {appointment.time}</p>
              {appointment.notes && (
                <p><strong>Observações:</strong> {appointment.notes}</p>
              )}
              <p className="status">
                <strong>Status:</strong> {appointment.completed ? 'Concluído' : 'Pendente'}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .appointment-list {
          margin-top: 2rem;
        }
        
        h2 {
          color: #e62e69;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .appointments {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .appointment-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: transform 0.2s;
          border-left: 4px solid #e62e69;
        }
        
        .appointment-card:hover {
          transform: translateY(-5px);
        }
        
        .appointment-card.completed {
          border-left-color: #4caf50;
        }
        
        .appointment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .appointment-header h3 {
          margin: 0;
          color: #333;
          font-family: 'Inter', sans-serif;
        }
        
        .appointment-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        
        .action-button.complete {
          color: #4caf50;
        }
        
        .action-button.delete {
          color: #f44336;
        }
        
        .action-button:hover {
          background-color: #f5f5f5;
        }
        
        .appointment-details p {
          margin: 0.5rem 0;
          font-family: 'Inter', sans-serif;
        }
        
        .status {
          margin-top: 1rem;
        }
        
        .loading, .no-appointments {
          text-align: center;
          padding: 2rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
        }
        
        .error-container {
          text-align: center;
          padding: 2rem;
          background-color: #ffebee;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
        }
        
        .error-message {
          color: #c62828;
          margin-bottom: 1rem;
        }
        
        .retry-button {
          background-color: #e62e69;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
          font-family: 'Inter', sans-serif;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .retry-button:hover {
          background-color: #d0225e;
        }
        
        .retry-button:disabled {
          background-color: #f5a5c0;
          cursor: not-allowed;
        }
        
        .retry-icon {
          animation: spin 1.5s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 