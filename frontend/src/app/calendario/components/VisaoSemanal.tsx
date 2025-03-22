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
    <div className="weekly-calendar">
      <div className="calendar-header">
        <h2>Visão Semanal</h2>
        <div className="week-navigation">
          <button onClick={prevWeek} className="nav-button">
            <FaChevronLeft />
          </button>
          <h3>
            {format(weekStart, "dd 'de' MMMM", { locale: ptBR })} - {format(weekEnd, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h3>
          <button onClick={nextWeek} className="nav-button">
            <FaChevronRight />
          </button>
        </div>
      </div>
      
      <div className="week-calendar-grid">
        {/* Cabeçalho com os dias da semana */}
        <div className="time-column">
          <div className="time-header">Hora</div>
          {timeSlots.map(hour => (
            <div key={hour} className="time-slot">
              {`${hour}:00`}
            </div>
          ))}
        </div>
        
        {/* Colunas dos dias da semana */}
        {daysInWeek.map(day => (
          <div key={day.toString()} className="day-column">
            <div className="day-header">
              <div className="day-name">{format(day, 'EEE', { locale: ptBR })}</div>
              <div className="day-number">{format(day, 'dd')}</div>
            </div>
            
            {/* Time slots para cada dia */}
            {timeSlots.map(hour => {
              const appointmentsAtSlot = getAppointmentsForTimeSlot(day, hour);
              const hasAppointments = appointmentsAtSlot.length > 0;
              
              return (
                <div key={`${day}-${hour}`} className={`day-time-slot ${hasAppointments ? 'has-appointments' : ''}`}>
                  {hasAppointments && appointmentsAtSlot.map(appointment => (
                    <div 
                      key={appointment._id}
                      className={`appointment-card ${appointment.completed ? 'completed' : ''}`}
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="appointment-time">{appointment.time}</div>
                      <div className="appointment-client">{appointment.clientName}</div>
                      <div className="appointment-service">{appointment.service}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Modal de detalhes do agendamento */}
      {selectedAppointment && (
        <div className="appointment-modal-backdrop" onClick={() => setSelectedAppointment(null)}>
          <div className="appointment-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedAppointment.clientName}</h3>
            <div className="appointment-details">
              <p><strong>Serviço:</strong> {selectedAppointment.service}</p>
              <p><strong>Valor:</strong> R$ {selectedAppointment.value.toFixed(2)}</p>
              <p><strong>Data:</strong> {format(new Date(selectedAppointment.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
              <p><strong>Horário:</strong> {selectedAppointment.time}</p>
              {selectedAppointment.notes && (
                <p><strong>Observações:</strong> {selectedAppointment.notes}</p>
              )}
              <p className="status">
                <strong>Status:</strong> {selectedAppointment.completed ? 'Concluído' : 'Pendente'}
              </p>
            </div>
            
            <div className="modal-actions">
              {!selectedAppointment.completed && (
                <button 
                  className="action-button complete"
                  onClick={() => markAsCompleted(selectedAppointment._id)}
                >
                  <FaCheck /> Concluído
                </button>
              )}
              <button 
                className="action-button delete"
                onClick={() => deleteAppointment(selectedAppointment._id)}
              >
                <FaTrash /> Excluir
              </button>
              <button 
                className="action-button close"
                onClick={() => setSelectedAppointment(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .weekly-calendar {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        h2 {
          color: #e62e69;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        .week-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-button {
          background: none;
          border: 1px solid #e1e1e1;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-button:hover {
          background-color: #f7f7f7;
          border-color: #ccc;
        }

        h3 {
          margin: 0;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }

        .week-calendar-grid {
          display: grid;
          grid-template-columns: 80px repeat(7, 1fr);
          border: 1px solid #e1e1e1;
          border-radius: 4px;
          overflow: hidden;
        }

        .time-column {
          background-color: #f9f9f9;
          border-right: 1px solid #e1e1e1;
        }

        .time-header, .day-header {
          padding: 1rem 0.5rem;
          text-align: center;
          font-weight: 500;
          background-color: #f9f9f9;
          border-bottom: 1px solid #e1e1e1;
          font-family: 'Inter', sans-serif;
        }

        .time-slot {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #e1e1e1;
          font-size: 0.9rem;
          color: #666;
          font-family: 'Inter', sans-serif;
        }

        .day-column {
          border-right: 1px solid #e1e1e1;
        }

        .day-column:last-child {
          border-right: none;
        }

        .day-name {
          text-transform: capitalize;
          font-family: 'Inter', sans-serif;
        }

        .day-number {
          font-size: 1.2rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
        }

        .day-time-slot {
          height: 80px;
          border-bottom: 1px solid #e1e1e1;
          padding: 0.25rem;
          overflow: auto;
        }

        .day-time-slot.has-appointments {
          background-color: #fef8fa;
        }

        .appointment-card {
          background-color: #fff8fa;
          border-left: 3px solid #e62e69;
          padding: 0.5rem;
          margin-bottom: 0.25rem;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .appointment-card:hover {
          background-color: #ffedf2;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .appointment-card.completed {
          border-left-color: #4caf50;
          background-color: #f1f8e9;
        }

        .appointment-time {
          font-size: 0.8rem;
          color: #666;
          font-family: 'Inter', sans-serif;
        }

        .appointment-client {
          font-weight: 600;
          font-size: 0.9rem;
          margin: 0.2rem 0;
          font-family: 'Inter', sans-serif;
        }

        .appointment-service {
          font-size: 0.8rem;
          color: #333;
          font-family: 'Inter', sans-serif;
        }

        .loading {
          padding: 2rem;
          text-align: center;
          font-family: 'Inter', sans-serif;
        }

        .error-container {
          padding: 1.5rem;
          text-align: center;
        }

        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
        }

        .retry-button {
          background-color: #e62e69;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
        }

        .retry-button:disabled {
          background-color: #f5a5c0;
          cursor: not-allowed;
        }

        .retry-icon {
          animation: ${isRetrying ? 'spin 1s linear infinite' : 'none'};
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Modal Styles */
        .appointment-modal-backdrop {
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

        .appointment-modal {
          background-color: white;
          border-radius: 8px;
          padding: 2rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          font-family: 'Inter', sans-serif;
        }

        .appointment-modal h3 {
          color: #e62e69;
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
        }

        .appointment-details {
          margin-bottom: 2rem;
        }

        .appointment-details p {
          margin: 0.5rem 0;
          font-family: 'Inter', sans-serif;
        }

        .status {
          padding: 0.5rem;
          border-radius: 4px;
          background-color: ${selectedAppointment?.completed ? '#e8f5e9' : '#fff8fa'};
          color: ${selectedAppointment?.completed ? '#2e7d32' : '#c2185b'};
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .action-button {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }

        .action-button.complete {
          background-color: #4caf50;
          color: white;
        }

        .action-button.delete {
          background-color: #f44336;
          color: white;
        }

        .action-button.close {
          background-color: #e0e0e0;
          color: #333;
        }
      `}</style>
    </div>
  );
} 