"use client";

import { useState } from 'react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { FaFileExport, FaSpinner } from 'react-icons/fa';

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

interface ExportReportProps {
  userId: string;
}

export default function ExportReport({ userId }: ExportReportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const exportReport = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Tentar até 3 vezes em caso de falha na conexão
      let retries = 0;
      const maxRetries = 3;
      let success = false;
      let response;

      // Calcular período de 30 dias
      const endDate = new Date();
      const startDate = subDays(endDate, 30);
      
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

      if (!response || !response.data) {
        throw new Error('Não foi possível carregar os dados de agendamentos');
      }

      // Filtrar agendamentos dos últimos 30 dias que estejam concluídos
      const appointments: Appointment[] = response.data;
      const last30DaysAppointments = appointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate >= startDate && 
               appDate <= endDate && 
               app.completed;
      });

      // Agrupar por semana
      const weeks: { [weekKey: string]: Appointment[] } = {};
      
      last30DaysAppointments.forEach(app => {
        const appDate = new Date(app.date);
        const weekStart = startOfWeek(appDate, { weekStartsOn: 0 }); // Domingo
        const weekEnd = endOfWeek(appDate, { weekStartsOn: 0 }); // Sábado
        
        const weekKey = `${format(weekStart, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM', { locale: ptBR })}`;
        
        if (!weeks[weekKey]) {
          weeks[weekKey] = [];
        }
        
        weeks[weekKey].push(app);
      });

      // Gerar o relatório
      let report = 'RELATÓRIO DE GANHOS - ÚLTIMOS 30 DIAS\n';
      report += `Período: ${format(startDate, 'dd/MM/yyyy', { locale: ptBR })} a ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}\n\n`;
      
      let totalGeral = 0;
      
      Object.keys(weeks).forEach(weekKey => {
        const weekAppointments = weeks[weekKey];
        const weekTotal = weekAppointments.reduce((sum, app) => sum + app.value, 0);
        totalGeral += weekTotal;
        
        report += `=== SEMANA: ${weekKey} ===\n`;
        report += `Total da semana: R$ ${weekTotal.toFixed(2)}\n`;
        report += `Procedimentos concluídos: ${weekAppointments.length}\n\n`;
        
        // Detalhamento dos agendamentos da semana
        weekAppointments.forEach(app => {
          report += `- ${format(new Date(app.date), 'dd/MM/yyyy', { locale: ptBR })} - ${app.time}\n`;
          report += `  Cliente: ${app.clientName}\n`;
          report += `  Serviço: ${app.service}\n`;
          report += `  Valor: R$ ${app.value.toFixed(2)}\n`;
          if (app.notes) report += `  Obs: ${app.notes}\n`;
          report += '\n';
        });
        
        report += '\n';
      });
      
      report += `=== RESUMO GERAL ===\n`;
      report += `Total no período de 30 dias: R$ ${totalGeral.toFixed(2)}\n`;
      report += `Total de procedimentos concluídos: ${last30DaysAppointments.length}\n`;
      report += `Média por procedimento: R$ ${(totalGeral / last30DaysAppointments.length || 0).toFixed(2)}\n`;
      
      // Criar e baixar o arquivo
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-ganhos-${format(new Date(), 'yyyyMMdd')}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Relatório exportado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao exportar relatório:', err);
      setError('Erro ao exportar relatório. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="export-report">
      <button 
        className="export-button"
        onClick={exportReport}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <FaSpinner className="spin-icon" />
            Exportando...
          </>
        ) : (
          <>
            <FaFileExport />
            Exportar Ganhos
          </>
        )}
      </button>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <style jsx>{`
        .export-report {
          margin-top: 1rem;
        }
        
        .export-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #4caf50, #388e3c);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 15px rgba(76, 175, 80, 0.25);
          width: 100%;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        .export-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
          z-index: 1;
        }
        
        .export-button * {
          position: relative;
          z-index: 2;
        }
        
        .export-button:hover {
          background: linear-gradient(135deg, #43a047, #2e7d32);
          transform: translateY(-3px);
          box-shadow: 0 12px 20px rgba(76, 175, 80, 0.35);
        }
        
        .export-button:active {
          transform: translateY(-1px);
          box-shadow: 0 5px 10px rgba(76, 175, 80, 0.3);
        }
        
        .export-button:disabled {
          background: linear-gradient(135deg, #9e9e9e, #757575);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
        
        .error-message {
          color: #f44336;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          font-family: 'Poppins', sans-serif;
          text-align: center;
        }
        
        .success-message {
          color: #4caf50;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          font-family: 'Poppins', sans-serif;
          text-align: center;
        }
      `}</style>
    </div>
  );
} 