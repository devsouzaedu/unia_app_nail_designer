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
    <div className="visao-mensal">
      <div className="header">
        <h2>Visão Mensal</h2>
        <div className="date-nav">
          <button onClick={prevMonth} className="nav-button">
            <FaChevronLeft />
          </button>
          <h3 className="current-month">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h3>
          <button onClick={nextMonth} className="nav-button">
            <FaChevronRight />
          </button>
        </div>
      </div>
      
      <div className="calendar-grid">
        {/* Cabeçalho dos dias da semana */}
        {weekDays.map(day => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}
        
        {/* Dias do mês */}
        {Array.from({ length: getDay(monthStart) }).map((_, index) => (
          <div key={`empty-${index}`} className="day-cell empty"></div>
        ))}
        
        {daysInMonth.map(day => {
          const dayAppointments = getAppointmentsForDay(day);
          const hasAppointments = dayAppointments.length > 0;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <div 
              key={day.toString()} 
              className={`day-cell ${hasAppointments ? 'has-appointments' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
              onClick={() => hasAppointments && handleDayClick(day)}
            >
              <div className="day-number">
                {format(day, 'd')}
              </div>
              
              {hasAppointments && (
                <div className="appointment-count">
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
        <div className="day-detail-modal" onClick={closeDayDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="close-button" onClick={closeDayDetails}>×</div>
            <h4 className="modal-title">Agendamentos em {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</h4>
            
            <div className="appointments-list">
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
        </div>
      )}
      
      {/* Modal de detalhes do agendamento */}
      {selectedAppointment && (
        <div className="day-detail-modal" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="close-button" onClick={() => setSelectedAppointment(null)}>×</div>
            <h4 className="modal-title">{selectedAppointment.clientName}</h4>
            
            <div className="appointments-list">
              <div className="appointment-item">
                <div className="appointment-time">{selectedAppointment.time}</div>
                <div className="appointment-info">
                  <div className="appointment-client">{selectedAppointment.clientName}</div>
                  <div className="appointment-service">{selectedAppointment.service}</div>
                </div>
                <div className="appointment-value">
                  R$ {selectedAppointment.value.toFixed(2)}
                </div>
              </div>
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
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .visao-mensal {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
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

        .current-month {
          margin: 0 1rem;
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          text-transform: capitalize;
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

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          text-align: center;
        }

        .day-header {
          font-weight: 500;
          color: #666;
          padding: 0.5rem;
          text-transform: uppercase;
          font-size: 0.8rem;
        }

        .day-cell {
          min-height: 100px;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 0.5rem;
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
        }

        .day-cell:hover {
          background-color: #fafafa;
          border-color: #e1e1e1;
        }

        .day-cell.other-month {
          background-color: #f9f9f9;
          color: #aaa;
        }

        .day-cell.today {
          border-color: #e62e69;
          background-color: #fff8fa;
          position: relative;
        }

        .day-cell.today::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #e62e69;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }

        .day-number {
          font-weight: 500;
          font-size: 1rem;
          color: #333;
          margin-bottom: 0.5rem;
          display: inline-block;
        }

        .appointment-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #e62e69;
          color: white;
          font-size: 0.7rem;
          font-weight: 500;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          margin-left: 0.5rem;
        }

        .appointment-preview {
          font-size: 0.8rem;
          color: #555;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 0.25rem;
          text-align: left;
        }

        .more-appointments {
          font-size: 0.75rem;
          color: #e62e69;
          font-weight: 500;
          text-align: center;
          margin-top: 0.25rem;
        }

        .day-detail-modal {
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

        .modal-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #333;
          text-align: center;
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .appointment-item {
          padding: 1rem;
          border-left: 4px solid #e62e69;
          background-color: #fff;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .appointment-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .appointment-item.completed {
          border-left-color: #4caf50;
        }

        .appointment-time {
          font-weight: 600;
          color: #e62e69;
          margin-bottom: 0.25rem;
        }

        .appointment-item.completed .appointment-time {
          color: #4caf50;
        }

        .appointment-client {
          font-weight: 500;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .appointment-service {
          color: #666;
          font-size: 0.9rem;
        }

        .appointment-value {
          font-weight: 500;
          color: #333;
          margin-top: 0.5rem;
        }

        .no-appointments {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
          
          .date-nav {
            width: 100%;
            justify-content: space-between;
          }
          
          .calendar-grid {
            gap: 0.25rem;
          }
          
          .day-cell {
            min-height: 80px;
            padding: 0.25rem;
          }
          
          .day-number {
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
          }
          
          .appointment-count {
            width: 18px;
            height: 18px;
            font-size: 0.65rem;
          }
          
          .appointment-preview {
            font-size: 0.7rem;
            margin-bottom: 0.2rem;
          }
          
          .more-appointments {
            font-size: 0.7rem;
          }
          
          .day-header {
            font-size: 0.7rem;
            padding: 0.25rem;
          }
          
          .modal-content {
            width: 95%;
            padding: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .day-cell {
            min-height: 60px;
          }
          
          .appointment-preview {
            display: none;
          }
          
          .day-number {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
} 