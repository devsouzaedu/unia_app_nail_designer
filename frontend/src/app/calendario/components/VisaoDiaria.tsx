"use client";

import { useState, useEffect } from 'react';
import { 
  format, 
  isSameDay, 
  parseISO,
  addDays,
  subDays,
  isToday,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaSync, FaCheck, FaTrash, FaClock } from 'react-icons/fa';

interface Appointment {
  _id: string;
  clientName: string;
  service: string;
  value: number;
  date: string;
  time: string;
  completed: boolean;
  notes?: string;
  color?: string;
}

interface VisaoDiariaProps {
  userId: string;
  refreshTrigger: number;
  onAppointmentUpdated: () => void;
}

export default function VisaoDiaria({ userId, refreshTrigger, onAppointmentUpdated }: VisaoDiariaProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [sortedAppointments, setSortedAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchAppointments();
  }, [userId, refreshTrigger, selectedDate]);

  useEffect(() => {
    // Ordenar os agendamentos por horário
    if (appointments.length > 0) {
      const sorted = [...appointments].sort((a, b) => {
        return a.time.localeCompare(b.time);
      });
      setSortedAppointments(sorted);
    } else {
      setSortedAppointments([]);
    }
  }, [appointments]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Obter o início e fim do dia selecionado
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);
      
      // Fazer a requisição para a API
      const response = await axios.get('/api/appointments', {
        params: {
          userId,
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd')
        }
      });
      
      // Se a requisição for bem-sucedida, atualizar o estado dos agendamentos
      setAppointments(response.data || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      setError('Falha ao carregar agendamentos. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    fetchAppointments().finally(() => setIsRetrying(false));
  };

  const nextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const prevDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const setToday = () => {
    setSelectedDate(new Date());
  };

  const markAsCompleted = async (id: string) => {
    try {
      await axios.patch(`/api/appointments/${id}`, {
        completed: true
      });
      
      // Atualizar o estado local
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === id ? { ...apt, completed: true } : apt
        )
      );
      
      // Fechar o modal de detalhes
      setSelectedAppointment(null);
      
      // Notificar o componente pai
      onAppointmentUpdated();
    } catch (err) {
      console.error('Erro ao marcar agendamento como concluído:', err);
      setError('Falha ao atualizar o agendamento. Por favor, tente novamente.');
    }
  };

  const deleteAppointment = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await axios.delete(`/api/appointments/${id}`);
        
        // Atualizar o estado local
        setAppointments(prev => prev.filter(apt => apt._id !== id));
        
        // Fechar o modal de detalhes
        setSelectedAppointment(null);
        
        // Notificar o componente pai
        onAppointmentUpdated();
      } catch (err) {
        console.error('Erro ao excluir agendamento:', err);
        setError('Falha ao excluir o agendamento. Por favor, tente novamente.');
      }
    }
  };

  const formatTime = (time: string) => {
    // Formatar hora no formato 24h para o formato 12h
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getTimeSlots = () => {
    // Horários comuns de trabalho (8h às 20h)
    const timeSlots = [];
    for (let i = 8; i <= 20; i++) {
      timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return timeSlots;
  };

  return (
    <div className="visao-diaria-container">
      <div className="header">
        <div className="date-nav">
          <button className="nav-button" onClick={prevDay} aria-label="Dia anterior">
            <FaChevronLeft />
          </button>
          
          <div className="current-date">
            <h2>{format(selectedDate, "EEEE", { locale: ptBR })}</h2>
            <span className={`date-display ${isToday(selectedDate) ? 'today' : ''}`}>
              {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              {isToday(selectedDate) && <span className="today-badge"> (Hoje)</span>}
            </span>
          </div>
          
          <button className="nav-button" onClick={nextDay} aria-label="Próximo dia">
            <FaChevronRight />
          </button>
        </div>
        
        <div className="actions">
          <button 
            className="today-button" 
            onClick={setToday} 
            disabled={isToday(selectedDate)}
          >
            Hoje
          </button>
          <button 
            className="refresh-button" 
            onClick={handleRetry} 
            disabled={isRetrying}
          >
            <FaSync className={isRetrying ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      <div className="day-selector">
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(startOfDay(selectedDate), i - 3);
          return (
            <button 
              key={i}
              className={`day-button ${isSameDay(day, selectedDate) ? 'selected' : ''} ${isToday(day) ? 'today' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <span className="day-name">{format(day, 'EEE', { locale: ptBR })}</span>
              <span className="day-number">{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <p>Carregando agendamentos...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button className="retry-button" onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}
          </button>
        </div>
      ) : (
        <div className="appointments-list">
          <h3 className="list-title">
            <FaClock /> Horários do dia
          </h3>
          
          {sortedAppointments.length === 0 ? (
            <div className="no-appointments">
              <p>Não há agendamentos para este dia.</p>
            </div>
          ) : (
            <div className="appointments-grid">
              {sortedAppointments.map((appointment) => (
                <div 
                  key={appointment._id}
                  className={`appointment-card ${appointment.completed ? 'completed' : ''}`}
                  style={{ borderLeft: appointment.color ? `4px solid ${appointment.color}` : '4px solid #e62e69' }}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="appointment-time">{formatTime(appointment.time)}</div>
                  <div className="appointment-client">{appointment.clientName}</div>
                  <div className="appointment-service">{appointment.service}</div>
                  <div className="appointment-value">R$ {appointment.value.toFixed(2)}</div>
                  {appointment.completed && (
                    <div className="completed-badge">
                      <FaCheck /> Concluído
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedAppointment && (
        <div className="appointment-detail-modal">
          <div className="modal-content">
            <button className="close-button" onClick={() => setSelectedAppointment(null)}>×</button>
            <h3>Detalhes do Agendamento</h3>
            
            <div className="detail-content">
              <div className="detail-row">
                <span className="label">Cliente:</span>
                <span className="value">{selectedAppointment.clientName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Serviço:</span>
                <span className="value">{selectedAppointment.service}</span>
              </div>
              <div className="detail-row">
                <span className="label">Valor:</span>
                <span className="value">R$ {selectedAppointment.value.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Data:</span>
                <span className="value">
                  {format(parseISO(selectedAppointment.date), "dd/MM/yyyy")}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Hora:</span>
                <span className="value">{selectedAppointment.time}</span>
              </div>
              {selectedAppointment.notes && (
                <div className="detail-row">
                  <span className="label">Observações:</span>
                  <span className="value notes">{selectedAppointment.notes}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`value status ${selectedAppointment.completed ? 'completed' : 'pending'}`}>
                  {selectedAppointment.completed ? 'Concluído' : 'Pendente'}
                </span>
              </div>
            </div>
            
            <div className="modal-actions">
              {!selectedAppointment.completed && (
                <button 
                  className="complete-button"
                  onClick={() => markAsCompleted(selectedAppointment._id)}
                >
                  <FaCheck /> Marcar como Concluído
                </button>
              )}
              
              <button 
                className="delete-button"
                onClick={() => deleteAppointment(selectedAppointment._id)}
              >
                <FaTrash /> Excluir Agendamento
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .visao-diaria-container {
          font-family: 'Inter', sans-serif;
          margin-bottom: 1.5rem;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        
        .date-nav {
          display: flex;
          align-items: center;
        }
        
        .nav-button {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #e62e69;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: background-color 0.3s;
        }
        
        .nav-button:hover {
          background-color: rgba(230, 46, 105, 0.1);
        }
        
        .current-date {
          margin: 0 1rem;
          text-align: center;
        }
        
        .current-date h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
          text-transform: capitalize;
        }
        
        .date-display {
          font-size: 1rem;
          color: #666;
        }
        
        .date-display.today {
          color: #e62e69;
          font-weight: 500;
        }
        
        .today-badge {
          font-weight: 700;
          color: #e62e69;
        }
        
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .today-button, .refresh-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
        }
        
        .today-button {
          background-color: #e62e69;
          color: white;
        }
        
        .today-button:hover {
          background-color: #d41e59;
        }
        
        .today-button:disabled {
          background-color: #eee;
          color: #999;
          cursor: not-allowed;
        }
        
        .refresh-button {
          background-color: #f4f4f4;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: 50%;
        }
        
        .refresh-button:hover {
          background-color: #e6e6e6;
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
        
        .day-selector {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          gap: 0.5rem;
        }
        
        .day-button {
          flex: 1;
          min-width: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 0.5rem;
          border: 1px solid #eee;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .day-button.selected {
          background-color: #e62e69;
          color: white;
          border-color: #e62e69;
        }
        
        .day-button.today:not(.selected) {
          border-color: #e62e69;
          color: #e62e69;
        }
        
        .day-button:hover:not(.selected) {
          border-color: #e62e69;
          background-color: rgba(230, 46, 105, 0.05);
        }
        
        .day-name {
          font-size: 0.8rem;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }
        
        .day-number {
          font-size: 1.2rem;
          font-weight: 700;
        }
        
        .loading-container, .error-container {
          padding: 2rem;
          text-align: center;
          background-color: #f9f9f9;
          border-radius: 8px;
          margin-top: 1rem;
        }
        
        .error-container {
          color: #e62e69;
        }
        
        .retry-button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background-color: #e62e69;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .retry-button:hover {
          background-color: #d41e59;
        }
        
        .list-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.2rem;
          color: #333;
          margin-bottom: 1rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }
        
        .no-appointments {
          text-align: center;
          padding: 2rem;
          color: #666;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        
        .appointments-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .appointment-card {
          display: grid;
          grid-template-columns: 80px 1fr 1fr auto;
          align-items: center;
          padding: 1rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        
        @media (max-width: 768px) {
          .appointment-card {
            grid-template-columns: 80px 1fr;
            grid-template-rows: auto auto;
            gap: 0.5rem;
          }
          
          .appointment-time {
            grid-row: span 2;
          }
          
          .appointment-value {
            grid-column: 2;
          }
          
          .header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .date-nav {
            width: 100%;
            justify-content: space-between;
          }
          
          .actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
        
        .appointment-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .appointment-card.completed {
          opacity: 0.7;
          background-color: #f9f9f9;
        }
        
        .appointment-time {
          font-weight: 700;
          font-size: 1.1rem;
          color: #e62e69;
        }
        
        .appointment-client {
          font-weight: 500;
          color: #333;
        }
        
        .appointment-service {
          color: #666;
        }
        
        .appointment-value {
          font-weight: 500;
          color: #333;
        }
        
        .completed-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.2rem 0.5rem;
          background-color: #4caf50;
          color: white;
          border-radius: 4px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .appointment-detail-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          width: 90%;
          max-width: 500px;
          border-radius: 8px;
          padding: 1.5rem;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }
        
        .detail-content {
          margin: 1.5rem 0;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 1rem;
        }
        
        .label {
          font-weight: 500;
          color: #666;
          width: 120px;
          flex-shrink: 0;
        }
        
        .value {
          flex: 1;
          color: #333;
        }
        
        .value.notes {
          white-space: pre-wrap;
        }
        
        .value.status {
          font-weight: 500;
        }
        
        .value.status.completed {
          color: #4caf50;
        }
        
        .value.status.pending {
          color: #f9a825;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        
        .complete-button, .delete-button {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          transition: background-color 0.3s;
          flex: 1;
          justify-content: center;
        }
        
        .complete-button {
          background-color: #4caf50;
          color: white;
        }
        
        .complete-button:hover {
          background-color: #3d9440;
        }
        
        .delete-button {
          background-color: #f44336;
          color: white;
        }
        
        .delete-button:hover {
          background-color: #e53935;
        }
      `}</style>
    </div>
  );
} 