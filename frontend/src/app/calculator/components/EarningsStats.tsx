"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { FaSync } from 'react-icons/fa';

interface StatsData {
  totalEarnings: number;
  completedCount: number;
  startDate: string;
  endDate: string;
}

interface EarningsStatsProps {
  userId: string;
  refreshTrigger: number;
}

export default function EarningsStats({ userId, refreshTrigger }: EarningsStatsProps) {
  const [weeklyStats, setWeeklyStats] = useState<StatsData | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [userId, refreshTrigger]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Tentar até 3 vezes em caso de falha na conexão
      let retries = 0;
      const maxRetries = 3;
      let weeklySuccess = false;
      let monthlySuccess = false;
      let weeklyResponse, monthlyResponse;

      while ((retries < maxRetries) && (!weeklySuccess || !monthlySuccess)) {
        try {
          if (!weeklySuccess) {
            weeklyResponse = await axios.get(`https://calculator-for-nail-designers.onrender.com/api/appointments/stats/weekly/${userId}`);
            weeklySuccess = true;
          }
        } catch (err) {
          // Continuar tentando
        }

        try {
          if (!monthlySuccess) {
            monthlyResponse = await axios.get(`https://calculator-for-nail-designers.onrender.com/api/appointments/stats/monthly/${userId}`);
            monthlySuccess = true;
          }
        } catch (err) {
          // Continuar tentando
        }

        if (!weeklySuccess || !monthlySuccess) {
          retries++;
          if (retries >= maxRetries) break;
          // Esperar um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (weeklyResponse && weeklyResponse.data) {
        setWeeklyStats(weeklyResponse.data);
      }
      
      if (monthlyResponse && monthlyResponse.data) {
        setMonthlyStats(monthlyResponse.data);
      }
      
      if (!weeklySuccess && !monthlySuccess) {
        throw new Error('Não foi possível carregar as estatísticas');
      }
      
      setError('');
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
      setError('Erro ao carregar estatísticas. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    fetchStats();
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return `${format(start, "dd/MM", { locale: ptBR })} - ${format(end, "dd/MM/yyyy", { locale: ptBR })}`;
    } catch (err) {
      return 'Período inválido';
    }
  };

  if (isLoading) {
    return <div className="loading">Carregando estatísticas...</div>;
  }

  if (error && !weeklyStats && !monthlyStats) {
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
    <div className="earnings-stats">
      <h2>Estatísticas de Ganhos</h2>
      
      <div className="stats-container">
        {weeklyStats && (
          <div className="stats-card weekly">
            <h3>Ganhos Semanais</h3>
            <p className="date-range">
              {formatDateRange(weeklyStats.startDate, weeklyStats.endDate)}
            </p>
            <div className="stats-value">
              <span className="currency">R$</span>
              <span className="amount">{weeklyStats.totalEarnings.toFixed(2)}</span>
            </div>
            <p className="stats-detail">
              {weeklyStats.completedCount} procedimento(s) concluído(s)
            </p>
          </div>
        )}
        
        {monthlyStats && (
          <div className="stats-card monthly">
            <h3>Ganhos Mensais</h3>
            <p className="date-range">
              {formatDateRange(monthlyStats.startDate, monthlyStats.endDate)}
            </p>
            <div className="stats-value">
              <span className="currency">R$</span>
              <span className="amount">{monthlyStats.totalEarnings.toFixed(2)}</span>
            </div>
            <p className="stats-detail">
              {monthlyStats.completedCount} procedimento(s) concluído(s)
            </p>
          </div>
        )}
        
        {(!weeklyStats || !monthlyStats) && error && (
          <div className="partial-error">
            <p>{error}</p>
            <button className="retry-button small" onClick={handleRetry} disabled={isRetrying}>
              {isRetrying ? 'Tentando...' : 'Tentar novamente'}
            </button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .earnings-stats {
          margin-top: 2rem;
        }
        
        h2 {
          color: #e62e69;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .stats-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          text-align: center;
        }
        
        .stats-card.weekly {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .stats-card.monthly {
          background: linear-gradient(135deg, #fff0f6 0%, #ffe3ec 100%);
        }
        
        h3 {
          color: #333;
          margin-bottom: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .date-range {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .stats-value {
          display: flex;
          align-items: baseline;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .currency {
          font-size: 1.2rem;
          color: #e62e69;
          margin-right: 0.25rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }
        
        .amount {
          font-size: 2.5rem;
          font-weight: 700;
          color: #e62e69;
          font-family: 'Inter', sans-serif;
        }
        
        .stats-detail {
          color: #666;
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
          text-align: center;
          padding: 2rem;
          background-color: #ffebee;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
        }
        
        .error-message {
          color: #c62828;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .partial-error {
          background-color: #ffebee;
          color: #c62828;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          grid-column: 1 / -1;
          font-family: 'Inter', sans-serif;
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
        
        .retry-button.small {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
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