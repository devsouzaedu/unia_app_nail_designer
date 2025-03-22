"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import VisaoSemanal from './components/VisaoSemanal';
import VisaoMensal from './components/VisaoMensal';
import VisaoDiaria from './components/VisaoDiaria';
import NovoAgendamento from './components/NovoAgendamento';

// Componente de carregamento para o Suspense
function Loading() {
  return (
    <div className="loading-container">
      <div className="loading">Carregando...</div>
      <style jsx>{`
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
      `}</style>
    </div>
  );
}

// Componente principal que usa useSearchParams
function CalendarioContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('dia'); // 'dia', 'semana' ou 'mes'

  useEffect(() => {
    // Verificar se o usuário está autenticado ou se está no modo demo
    if (status !== 'loading') {
      if (session || isDemo) {
        setIsLoading(false);
      } else {
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
    <div className="calendario-container">
      <header className="page-header">
        <h1>Calendário de Agendamentos</h1>
        <p className="subtitle">
          Visualize e organize seus agendamentos de forma prática e eficiente
        </p>
        {isDemo && (
          <div className="demo-badge">
            Modo Demonstração
          </div>
        )}
      </header>

      <div className="tabs">
        <button 
          className={`tab-button ${activeView === 'dia' ? 'active' : ''}`}
          onClick={() => setActiveView('dia')}
        >
          Visão Diária
        </button>
        <button 
          className={`tab-button ${activeView === 'semana' ? 'active' : ''}`}
          onClick={() => setActiveView('semana')}
        >
          Visão Semanal
        </button>
        <button 
          className={`tab-button ${activeView === 'mes' ? 'active' : ''}`}
          onClick={() => setActiveView('mes')}
        >
          Visão Mensal
        </button>
      </div>

      <div className="content-section">
        {activeView === 'dia' ? (
          <div className="day-view-container">
            <VisaoDiaria 
              userId={userId} 
              refreshTrigger={refreshTrigger}
              onAppointmentUpdated={handleDataUpdated}
            />
          </div>
        ) : activeView === 'semana' ? (
          <div className="week-view-container">
            <VisaoSemanal 
              userId={userId} 
              refreshTrigger={refreshTrigger}
              onAppointmentUpdated={handleDataUpdated}
            />
          </div>
        ) : (
          <div className="month-view-container">
            <VisaoMensal 
              userId={userId} 
              refreshTrigger={refreshTrigger}
              onAppointmentUpdated={handleDataUpdated}
            />
          </div>
        )}
      </div>

      <div className="new-appointment-container">
        <NovoAgendamento 
          userId={userId} 
          onAppointmentAdded={handleDataUpdated} 
        />
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .calendario-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 1.5rem;
          position: relative;
        }
        
        h1 {
          color: #e62e69;
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .subtitle {
          color: #666;
          font-size: 1rem;
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
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
          overflow-x: auto;
          scrollbar-width: thin;
          -webkit-overflow-scrolling: touch;
        }
        
        .tabs::-webkit-scrollbar {
          height: 4px;
        }
        
        .tabs::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.2);
          border-radius: 4px;
        }
        
        .tab-button {
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 0.9rem;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
        }
        
        .tab-button.active {
          color: #e62e69;
          border-bottom-color: #e62e69;
        }
        
        .tab-button:hover {
          color: #e62e69;
        }
        
        .content-section {
          margin-bottom: 1.5rem;
        }
        
        .new-appointment-container {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-top: 1.5rem;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
        }
        
        .loading {
          padding: 1.5rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          text-align: center;
          font-family: 'Inter', sans-serif;
        }
        
        @media (max-width: 768px) {
          .calendario-container {
            padding: 0.75rem;
          }
          
          h1 {
            font-size: 1.5rem;
          }
          
          .subtitle {
            font-size: 0.9rem;
          }
          
          .tab-button {
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
          }
          
          .new-appointment-container {
            margin-top: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .calendario-container {
            padding: 0.5rem;
          }
          
          h1 {
            font-size: 1.3rem;
          }
          
          .subtitle {
            font-size: 0.8rem;
          }
          
          .tab-button {
            padding: 0.5rem 0.6rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}

// Componente principal da página envolvido em Suspense
export default function CalendarioPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CalendarioContent />
    </Suspense>
  );
} 