"use client";

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaSync } from 'react-icons/fa';

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

interface MonthlyCalendarProps {
  userId: string;
  refreshTrigger: number;
  onAppointmentUpdated: () => void;
}

export default function MonthlyCalendar({ userId, refreshTrigger, onAppointmentUpdated }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [userId, refreshTrigger, currentMonth]);

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

  const handleRetry = () => {
    setIsRetrying(true);
    fetchAppointments();
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
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
      await axios.delete(`http://localhost:3001/api/appointments/${id}`);
      
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

  // Gerar dias do mês atual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obter os dias da semana em português
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Função para verificar se um dia tem agendamentos
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, day);
    });
  };

  if (isLoading && appointments.length === 0) {
    return <div className="loading">Carregando calendário...</div>;
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
    <div className="monthly-calendar">
      <div className="calendar-header">
        <h2>Calendário de Agendamentos</h2>
        <div className="month-navigation">
          <button onClick={prevMonth} className="nav-button">
            <FaChevronLeft />
          </button>
          <h3>{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h3>
          <button onClick={nextMonth} className="nav-button">
            <FaChevronRight />
          </button>
        </div>
      </div>
      
      <div className="calendar-grid">
        {/* Cabeçalho dos dias da semana */}
        {weekDays.map(day => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
        
        {/* Dias do mês */}
        {daysInMonth.map(day => {
          const dayAppointments = getAppointmentsForDay(day);
          const hasAppointments = dayAppointments.length > 0;
          
          return (
            <div 
              key={day.toString()} 
              className={`calendar-day ${hasAppointments ? 'has-appointments' : ''}`}
            >
              <div className="day-header">
                {format(day, 'd')}
              </div>
              
              {hasAppointments && (
                <div className="day-appointments">
                  {dayAppointments.slice(0, 3).map(appointment => (
                    <div 
                      key={appointment._id}
                      className={`appointment-pill ${appointment.completed ? 'completed' : ''}`}
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <span className="time">{appointment.time}</span>
                      <span className="name">{appointment.clientName}</span>
                    </div>
                  ))}
                  
                  {dayAppointments.length > 3 && (
                    <div className="more-appointments">
                      +{dayAppointments.length - 3} mais
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
                  Marcar como Concluído
                </button>
              )}
              <button 
                className="action-button delete"
                onClick={() => deleteAppointment(selectedAppointment._id)}
              >
                Excluir Agendamento
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
        .monthly-calendar {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-top: 1rem;
        }
        
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .calendar-header h2 {
          color: #e62e69;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }
        
        .month-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .month-navigation h3 {
          margin: 0;
          font-size: 1.2rem;
          text-transform: capitalize;
          min-width: 150px;
          text-align: center;
          font-family: 'Inter', sans-serif;
        }
        
        .nav-button {
          background: none;
          border: 1px solid #ddd;
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
          background-color: #f5f5f5;
          border-color: #ccc;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }
        
        .weekday-header {
          text-align: center;
          font-weight: 500;
          padding: 0.5rem;
          background-color: #f9f9f9;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
        }
        
        .calendar-day {
          min-height: 100px;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 0.5rem;
          position: relative;
        }
        
        .calendar-day.has-appointments {
          background-color: #fff0f6;
          border-color: #ffcce0;
        }
        
        .day-header {
          text-align: right;
          font-weight: 500;
          margin-bottom: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .day-appointments {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .appointment-pill {
          background-color: #e62e69;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .appointment-pill:hover {
          transform: translateY(-2px);
        }
        
        .appointment-pill.completed {
          background-color: #4caf50;
        }
        
        .time {
          font-weight: 600;
        }
        
        .name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .more-appointments {
          font-size: 0.8rem;
          color: #666;
          text-align: center;
          margin-top: 0.25rem;
          font-family: 'Inter', sans-serif;
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
        }
        
        .error-container {
          background-color: #fff;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
        }
        
        .error-message {
          color: #e53935;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .retry-button {
          background-color: #e62e69;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
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
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Estilos do modal */
        .appointment-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .appointment-modal {
          background-color: #fff;
          border-radius: 8px;
          padding: 1.5rem;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .appointment-modal h3 {
          color: #e62e69;
          margin-top: 0;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .appointment-details {
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .appointment-details p {
          margin: 0.5rem 0;
        }
        
        .status {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          display: inline-block;
          margin-top: 0.5rem;
        }
        
        .modal-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .action-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          flex: 1;
          min-width: 120px;
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
          background-color: #9e9e9e;
          color: white;
        }
        
        @media (max-width: 768px) {
          .calendar-grid {
            grid-template-columns: repeat(7, 1fr);
            font-size: 0.9rem;
          }
          
          .calendar-day {
            min-height: 80px;
          }
          
          .appointment-pill {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
} 