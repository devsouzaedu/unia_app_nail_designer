// src/app/calculator/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import EarningsStats from './components/EarningsStats';
import ExportReport from './components/ExportReport';
// Removendo temporariamente a importação do MonthlyCalendar
// import MonthlyCalendar from './components/MonthlyCalendar';

// Componente de carregamento para o Suspense
function Loading() {
  return (
    <div className="loading-container">
      <div className="loading">Carregando...</div>
    </div>
  );
}

// Componente principal que usa useSearchParams
function CalculatorContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  
  // Adicionando logs para depuração
  console.log('Status da sessão:', status);
  console.log('Parâmetro demo:', searchParams.get('demo'));
  console.log('isDemo:', isDemo);
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // Alterado para 'list' como padrão

  useEffect(() => {
    // Verificar se o usuário está autenticado ou se está no modo demo
    if (status !== 'loading') {
      console.log('Status não está carregando. Session:', !!session, 'isDemo:', isDemo);
      if (session || isDemo) {
        console.log('Definindo isLoading como false');
        setIsLoading(false);
      } else {
        console.log('Redirecionando para /auth');
        // Redirecionar para a página de autenticação se não estiver autenticado e não for demo
        router.push('/auth');
      }
    }
  }, [session, status, isDemo, router]);

  const handleDataUpdated = () => {
    // Incrementar o trigger para forçar a atualização dos componentes
    setRefreshTrigger(prev => prev + 1);
  };

  // Se ainda estiver carregando a sessão, mostrar indicador de carregamento
  if (status === 'loading') {
    return (
      <div className="loading-container">
        <div className="loading">Verificando autenticação...</div>
      </div>
    );
  }

  // Se estiver carregando os dados, mostrar indicador de carregamento
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading">Carregando dados...</div>
      </div>
    );
  }

  // Usar o email como identificador único do usuário ou um ID demo
  const userId = session?.user?.email || 'demo-user@example.com';

  return (
    <div className="calculator-container">
      <header className="page-header">
        <h1>Calculadora de Ganhos para Nail Designers</h1>
        <p className="subtitle">
          Gerencie seus agendamentos e acompanhe seus ganhos semanais e mensais
        </p>
        {isDemo && (
          <div className="demo-badge">
            Modo Demonstração
          </div>
        )}
      </header>

      <div className="tabs">
        {/* Desabilitando temporariamente a aba de calendário */}
        {/*
        <button 
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendário Mensal
        </button>
        */}
        <button 
          className={`tab-button active`}
          onClick={() => setActiveTab('list')}
        >
          Lista de Agendamentos
        </button>
      </div>

      <div className="content-grid">
        <div className="form-section">
          <AppointmentForm 
            userId={userId} 
            onAppointmentAdded={handleDataUpdated} 
          />
          
          <div className="export-section">
            <ExportReport userId={userId} />
          </div>
        </div>
        
        <div className="stats-section">
          <EarningsStats 
            userId={userId} 
            refreshTrigger={refreshTrigger} 
          />
        </div>
      </div>
      
      <div className="view-section">
        {/* Removendo temporariamente a condição para o MonthlyCalendar */}
        <AppointmentList 
          userId={userId} 
          refreshTrigger={refreshTrigger} 
          onAppointmentUpdated={handleDataUpdated} 
        />
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .calculator-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 2rem;
          position: relative;
        }
        
        h1 {
          color: #e62e69;
          font-size: 2rem;
          margin-bottom: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .demo-badge {
          position: absolute;
          top: -10px;
          right: 0;
          background-color: #4caf50;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .tabs {
          display: flex;
          margin-bottom: 2rem;
          border-bottom: 1px solid #eee;
        }
        
        .tab-button {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 1rem;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        
        .tab-button.active {
          color: #e62e69;
          border-bottom-color: #e62e69;
        }
        
        .tab-button:hover {
          color: #e62e69;
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
        }
        
        .loading {
          padding: 2rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          text-align: center;
          font-family: 'Inter', sans-serif;
        }
        
        .auth-required {
          text-align: center;
          padding: 3rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          max-width: 500px;
          margin: 3rem auto;
        }
        
        .auth-link {
          display: inline-block;
          background-color: #e62e69;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          margin-top: 1rem;
          font-weight: 500;
          transition: background-color 0.2s;
          font-family: 'Inter', sans-serif;
        }
        
        .auth-link:hover {
          background-color: #d0225e;
        }
        
        .export-section {
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}

// Componente principal da página envolvido em Suspense
export default function CalculatorPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CalculatorContent />
    </Suspense>
  );
}
