"use client";

import { useState, useEffect } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addDays, 
  addWeeks, 
  subWeeks, 
  isSameDay, 
  parseISO,
  setHours,
  setMinutes 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaSync, FaCheck, FaTrash } from 'react-icons/fa';

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

interface VisaoSemanalProps {
  userId: string;
  refreshTrigger: number;
  onAppointmentUpdated: () => void;
}

export default function VisaoSemanal({ userId, refreshTrigger, onAppointmentUpdated }: VisaoSemanalProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [userId, refreshTrigger, currentWeek]);

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
          response = await axios.get(`https://calculator-for-nail-designers.onrender.com/api/appointments/${userId}`);
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

  const handleRetry = () => {
    setIsRetrying(true);
    fetchAppointments();
  };

  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const prevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const markAsCompleted = async (id: string) => {
    try {
      await axios.patch(`https://calculator-for-nail-designers.onrender.com/api/appointments/${id}`, {
        completed: true
      });
      
      // Atualizar a lista localmente
      setAppointments(appointments.map(appointment => 
        appointment._id === id ? { ...appointment, completed: true } : appointment
      ));
      
      // Fechar o modal
      setSelectedAppointment(null);
      
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
      await axios.delete(`https://calculator-for-nail-designers.onrender.com/api/appointments/${id}`);
      
      // Remover da lista localmente
      setAppointments(appointments.filter(appointment => appointment._id !== id));
      
      // Fechar o modal
      setSelectedAppointment(null);
      
      onAppointmentUpdated();
    } catch (err: any) {
      console.error('Erro ao excluir agendamento:', err);
      setError('Erro ao excluir o agendamento. Tente novamente.');
    }
  };

  // Gerar dias da semana atual
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // 0 = domingo
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Criar array com horários de 8:00 às 20:00
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

  // Função para obter agendamentos de um dia específico e horário específico
  const getAppointmentsForTimeSlot = (day: Date, hour: number) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const appointmentHour = parseInt(appointment.time.split(':')[0]);
      return isSameDay(appointmentDate, day) && appointmentHour === hour;
    });
  };

  if (isLoading && appointments.length === 0) {
    return <div className="loading">Carregando calendário semanal...</div>;
  }

  if (error && appointments.length === 0) {
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

  return (
    <div className="visao-semanal-container">
      <div className="header">
        <div className="date-nav">
          <button className="nav-button" onClick={prevWeek} aria-label="Semana anterior">
            <FaChevronLeft />
          </button>
          
          <div className="current-week">
            <span className="week-display">
              {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(weekEnd, "d 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          
          <button className="nav-button" onClick={nextWeek} aria-label="Próxima semana">
            <FaChevronRight />
          </button>
        </div>
        
        <div className="actions">
          <button 
            className="refresh-button" 
            onClick={handleRetry} 
            disabled={isRetrying}
          >
            <FaSync className={isRetrying ? 'spinning' : ''} />
          </button>
        </div>
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
        <div className="weekly-calendar">
          <div className="time-column">
            <div className="day-header"></div>
            {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => (
              <div key={hour} className="time-slot">
                {hour}:00
              </div>
            ))}
          </div>
          
          {daysInWeek.map((day) => (
            <div key={day.toString()} className="day-column">
              <div className={`day-header ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                <div className="day-name">{format(day, 'EEE', { locale: ptBR })}</div>
                <div className="day-number">{format(day, 'd')}</div>
              </div>
              
              {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => {
                const aptsForSlot = getAppointmentsForTimeSlot(day, hour);
                
                return (
                  <div key={hour} className="time-slot">
                    {aptsForSlot.length > 0 ? (
                      aptsForSlot.map((apt) => (
                        <div 
                          key={apt._id}
                          className={`appointment ${apt.completed ? 'completed' : ''}`}
                          onClick={() => setSelectedAppointment(apt)}
                        >
                          <span className="client-name">{apt.clientName}</span>
                          <span className="service">{apt.service}</span>
                        </div>
                      ))
                    ) : (
                      <div className="empty-slot"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
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
        .visao-semanal-container {
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
          margin-bottom: 0.5rem;
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
        
        .current-week {
          margin: 0 1rem;
          text-align: center;
        }
        
        .week-display {
          font-size: 1rem;
          color: #666;
        }
        
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .refresh-button {
          background-color: #f4f4f4;
          color: #666;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: 50%;
          cursor: pointer;
          transition: background-color 0.3s;
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
        
        .weekly-calendar {
          display: flex;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scroll-snap-type: x mandatory;
        }
        
        .time-column, .day-column {
          flex: 1;
          min-width: 100px;
          border-right: 1px solid #eee;
        }
        
        .time-column {
          min-width: 60px;
          background-color: #f9f9f9;
        }
        
        .day-column:last-child {
          border-right: none;
        }
        
        .day-header {
          height: 60px;
          padding: 0.5rem;
          text-align: center;
          border-bottom: 1px solid #eee;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background-color: #f9f9f9;
        }
        
        .day-header.today {
          background-color: rgba(230, 46, 105, 0.1);
        }
        
        .day-name {
          font-size: 0.8rem;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 0.25rem;
        }
        
        .day-number {
          font-size: 1.2rem;
          font-weight: 500;
          color: #333;
        }
        
        .time-slot {
          height: 60px;
          border-bottom: 1px solid #eee;
          padding: 0.25rem;
          overflow: hidden;
        }
        
        .time-column .time-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 0.8rem;
        }
        
        .appointment {
          background-color: #e62e69;
          color: white;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
          cursor: pointer;
          margin-bottom: 0.25rem;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          height: calc(100% - 0.5rem);
        }
        
        .appointment.completed {
          background-color: #4caf50;
        }
        
        .appointment:hover {
          opacity: 0.9;
        }
        
        .client-name {
          display: block;
          font-weight: 500;
          margin-bottom: 0.1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .service {
          font-size: 0.7rem;
          opacity: 0.9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .empty-slot {
          height: 100%;
          width: 100%;
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
        
        @media (max-width: 768px) {
          .weekly-calendar {
            min-width: 700px;
            scroll-padding: 8px;
            -ms-overflow-style: none;  /* IE and Edge */
          }
          
          .weekly-calendar::-webkit-scrollbar {
            height: 4px;
          }
          
          .weekly-calendar::-webkit-scrollbar-thumb {
            background-color: rgba(230, 46, 105, 0.3);
            border-radius: 4px;
          }
          
          .header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .date-nav {
            width: 100%;
            justify-content: space-between;
          }
          
          .actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.5rem;
          }
          
          .time-column, .day-column {
            min-width: 80px;
          }
          
          .time-column {
            min-width: 50px;
          }
          
          .day-header {
            height: 50px;
          }
          
          .time-slot {
            height: 50px;
          }
          
          .modal-content {
            width: 95%;
            padding: 1rem;
          }
          
          .detail-row {
            flex-direction: column;
          }
          
          .label {
            width: 100%;
            margin-bottom: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
} 