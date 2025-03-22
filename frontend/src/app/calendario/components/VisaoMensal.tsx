"use client";

import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameDay, 
  isSameMonth,
  getDay 
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

interface VisaoMensalProps {
  userId: string;
  refreshTrigger: number;
  onAppointmentUpdated: () => void;
}

export default function VisaoMensal({ userId, refreshTrigger, onAppointmentUpdated }: VisaoMensalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
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

  // Gerar dias do mês atual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obter os dias da semana em português
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Função para verificar se um dia tem agendamentos e quantos são
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, day);
    });
  };

  // Função para tratar clique em um dia
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  // Função para fechar a lista de agendamentos do dia
  const closeDayDetails = () => {
    setSelectedDate(null);
  };

  if (isLoading && appointments.length === 0) {
    return <div className="loading">Carregando calendário mensal...</div>;
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
        <h2>Visão Mensal</h2>
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
        {Array.from({ length: getDay(monthStart) }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty"></div>
        ))}
        
        {daysInMonth.map(day => {
          const dayAppointments = getAppointmentsForDay(day);
          const hasAppointments = dayAppointments.length > 0;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <div 
              key={day.toString()} 
              className={`calendar-day ${hasAppointments ? 'has-appointments' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
              onClick={() => hasAppointments && handleDayClick(day)}
            >
              <div className="day-header">
                {format(day, 'd')}
              </div>
              
              {hasAppointments && (
                <div className="day-appointment-count">
                  <span className="count-badge">{dayAppointments.length}</span>
                  <span className="count-text">
                    {dayAppointments.length === 1 ? 'agendamento' : 'agendamentos'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Exibir detalhes dos agendamentos do dia selecionado */}
      {selectedDate && (
        <div className="day-details">
          <div className="day-details-header">
            <h4>Agendamentos em {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</h4>
            <button className="close-button" onClick={closeDayDetails}>×</button>
          </div>
          
          <div className="day-appointments-list">
            {getAppointmentsForDay(selectedDate).length > 0 ? (
              getAppointmentsForDay(selectedDate).map(appointment => (
                <div 
                  key={appointment._id}
                  className={`appointment-item ${appointment.completed ? 'completed' : ''}`}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="appointment-time">{appointment.time}</div>
                  <div className="appointment-info">
                    <div className="appointment-client">{appointment.clientName}</div>
                    <div className="appointment-service">{appointment.service}</div>
                  </div>
                  <div className="appointment-value">
                    R$ {appointment.value.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-appointments">
                Nenhum agendamento para este dia.
              </div>
            )}
          </div>
        </div>
      )}
      
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
        .monthly-calendar {
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

        .month-navigation {
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
          text-transform: capitalize;
          font-family: 'Inter', sans-serif;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background-color: #e1e1e1;
          border: 1px solid #e1e1e1;
          border-radius: 4px;
          overflow: hidden;
        }

        .weekday-header {
          background-color: #f9f9f9;
          padding: 0.75rem 0;
          text-align: center;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }

        .calendar-day {
          background-color: white;
          min-height: 100px;
          padding: 0.5rem;
          position: relative;
        }

        .calendar-day.empty {
          background-color: #f9f9f9;
        }

        .calendar-day.other-month {
          background-color: #f9f9f9;
          color: #999;
        }

        .calendar-day.has-appointments {
          background-color: #fff8fa;
          cursor: pointer;
        }

        .calendar-day.has-appointments:hover {
          background-color: #ffedf2;
        }

        .day-header {
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-family: 'Inter', sans-serif;
        }

        .day-appointment-count {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 1.5rem;
          font-family: 'Inter', sans-serif;
        }

        .count-badge {
          background-color: #e62e69;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .count-text {
          font-size: 0.7rem;
          color: #666;
        }

        .day-details {
          margin-top: 1.5rem;
          padding: 1rem;
          background-color: #fff8fa;
          border-radius: 8px;
          border: 1px solid #ffe0e9;
        }

        .day-details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        h4 {
          margin: 0;
          color: #e62e69;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #666;
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .close-button:hover {
          background-color: #f7f7f7;
        }

        .day-appointments-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .appointment-item {
          display: flex;
          background-color: white;
          padding: 0.75rem;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border-left: 3px solid #e62e69;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .appointment-item:hover {
          background-color: #ffedf2;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .appointment-item.completed {
          border-left-color: #4caf50;
          background-color: #f1f8e9;
        }

        .appointment-time {
          width: 60px;
          font-weight: 500;
          color: #333;
          font-family: 'Inter', sans-serif;
        }

        .appointment-info {
          flex: 1;
        }

        .appointment-client {
          font-weight: 600;
          font-family: 'Inter', sans-serif;
        }

        .appointment-service {
          font-size: 0.9rem;
          color: #666;
          font-family: 'Inter', sans-serif;
        }

        .appointment-value {
          font-weight: 500;
          color: #2e7d32;
          font-family: 'Inter', sans-serif;
        }

        .no-appointments {
          padding: 1rem;
          text-align: center;
          color: #666;
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