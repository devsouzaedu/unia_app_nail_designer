"use client";

import { useState, useEffect, Suspense } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import VisaoSemanal from './components/VisaoSemanal';
import VisaoMensal from './components/VisaoMensal';
import VisaoDiaria from './components/VisaoDiaria';
import NovoAgendamento from './components/NovoAgendamento';
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';

// Componente de carregamento para o Suspense
function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div className="loading">Carregando...</div>
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid rgba(230, 46, 105, 0.1);
          border-top-color: #e62e69;
          animation: spin 1s infinite linear;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading {
          padding: 1rem 2rem;
          background-color: white;
          border-radius: 12px;
          text-align: center;
          font-family: 'Poppins', sans-serif;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
          animation: pulse 1.5s infinite ease-in-out;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
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
  const [mounted, setMounted] = useState(false);

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
    
    // Adicionar classe ao body para impedir zoom
    document.body.classList.add('no-pinch-zoom');
    
    // Marcar componente como montado para animar os elementos
    setTimeout(() => {
      setMounted(true);
    }, 100);
    
    return () => {
      document.body.classList.remove('no-pinch-zoom');
    };
  }, [session, status, isDemo, router]);

  const handleDataUpdated = () => {
    // Incrementar o trigger para forçar a atualização dos componentes
    setRefreshTrigger(prev => prev + 1);
  };

  // Se ainda estiver carregando a sessão, mostrar indicador de carregamento
  if (status === 'loading') {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading">Verificando autenticação...</div>
      </div>
    );
  }

  // Se estiver carregando os dados, mostrar indicador de carregamento
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading">Carregando dados...</div>
      </div>
    );
  }

  // Usar o email como identificador único do usuário ou um ID demo
  const userId = session?.user?.email || 'demo-user@example.com';

  return (
    <>
      <Head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
        />
      </Head>
      <div className={`calendario-container ${mounted ? 'mounted' : ''}`}>
        <div className="backdrop-blur"></div>
        <div className="content-wrapper">
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
              <FaCalendarDay className="tab-icon" />
              <span>Visão Diária</span>
            </button>
            <button 
              className={`tab-button ${activeView === 'semana' ? 'active' : ''}`}
              onClick={() => setActiveView('semana')}
            >
              <FaCalendarWeek className="tab-icon" />
              <span>Visão Semanal</span>
            </button>
            <button 
              className={`tab-button ${activeView === 'mes' ? 'active' : ''}`}
              onClick={() => setActiveView('mes')}
            >
              <FaCalendarAlt className="tab-icon" />
              <span>Visão Mensal</span>
            </button>
          </div>

          <div className="content-section">
            {activeView === 'dia' ? (
              <div className="view-container day-view-container">
                <VisaoDiaria 
                  userId={userId} 
                  refreshTrigger={refreshTrigger}
                  onAppointmentUpdated={handleDataUpdated}
                />
              </div>
            ) : activeView === 'semana' ? (
              <div className="view-container week-view-container">
                <VisaoSemanal 
                  userId={userId} 
                  refreshTrigger={refreshTrigger}
                  onAppointmentUpdated={handleDataUpdated}
                />
              </div>
            ) : (
              <div className="view-container month-view-container">
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
        </div>

        <style jsx global>{`
          .no-pinch-zoom {
            touch-action: pan-x pan-y;
          }
        `}</style>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          .calendario-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.5rem;
            font-family: 'Poppins', sans-serif;
            position: relative;
            overflow: hidden;
            min-height: 100vh;
          }
          
          .calendario-container.mounted .page-header h1,
          .calendario-container.mounted .page-header .subtitle,
          .calendario-container.mounted .tabs,
          .calendario-container.mounted .view-container,
          .calendario-container.mounted .new-appointment-container {
            opacity: 1;
            transform: translateY(0);
          }
          
          .backdrop-blur {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23e62e69' fill-opacity='0.05'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            z-index: -1;
          }
          
          .content-wrapper {
            position: relative;
            z-index: 1;
          }
          
          .page-header {
            text-align: center;
            margin-bottom: 2rem;
            position: relative;
          }
          
          .page-header h1 {
            color: #e62e69;
            font-size: 2.2rem;
            margin-bottom: 0.75rem;
            font-weight: 700;
            position: relative;
            display: inline-block;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.5s ease;
            transition-delay: 0.1s;
          }
          
          .page-header h1::after {
            content: "";
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 4px;
            background: linear-gradient(to right, #e62e69, transparent);
            border-radius: 2px;
          }
          
          .subtitle {
            color: #666;
            font-size: 1.1rem;
            font-weight: 400;
            margin-bottom: 1rem;
            opacity: 0;
            transform: translateY(-15px);
            transition: all 0.5s ease;
            transition-delay: 0.2s;
          }
          
          .demo-badge {
            position: absolute;
            top: -10px;
            right: 0;
            background: linear-gradient(135deg, #4caf50, #2e7d32);
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            box-shadow: 0 4px 8px rgba(0, 128, 0, 0.2);
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          .tabs {
            display: flex;
            margin-bottom: 2rem;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            padding: 0.5rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.5);
            overflow-x: auto;
            scrollbar-width: thin;
            -webkit-overflow-scrolling: touch;
            opacity: 0;
            transform: translateY(-15px);
            transition: all 0.5s ease;
            transition-delay: 0.3s;
          }
          
          .tabs::-webkit-scrollbar {
            height: 4px;
          }
          
          .tabs::-webkit-scrollbar-thumb {
            background-color: rgba(230, 46, 105, 0.3);
            border-radius: 4px;
          }
          
          .tab-button {
            flex: 1;
            padding: 0.85rem 1rem;
            background: transparent;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            color: #666;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Poppins', sans-serif;
            white-space: nowrap;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          
          .tab-icon {
            font-size: 1.1rem;
          }
          
          .tab-button.active {
            color: #e62e69;
            background-color: rgba(230, 46, 105, 0.1);
            box-shadow: 0 2px 8px rgba(230, 46, 105, 0.15);
            font-weight: 600;
          }
          
          .tab-button:hover:not(.active) {
            color: #e62e69;
            background-color: rgba(230, 46, 105, 0.05);
          }
          
          .content-section {
            margin-bottom: 2rem;
          }
          
          .view-container {
            opacity: 0;
            transform: translateY(15px);
            transition: all 0.5s ease;
            transition-delay: 0.4s;
            background: rgba(255, 255, 255, 0.9);
            padding: 1.5rem;
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
          }
          
          .new-appointment-container {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 16px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
            margin-top: 2rem;
            opacity: 0;
            transform: translateY(15px);
            transition: all 0.5s ease;
            transition-delay: 0.5s;
            border: 1px solid rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            overflow: hidden;
          }
          
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 70vh;
          }
          
          .loading-spinner {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid rgba(230, 46, 105, 0.1);
            border-top-color: #e62e69;
            animation: spin 1s infinite linear;
            margin-bottom: 1rem;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .loading {
            padding: 1rem 2rem;
            background-color: white;
            border-radius: 12px;
            text-align: center;
            font-family: 'Poppins', sans-serif;
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
          }
          
          @media (max-width: 768px) {
            .calendario-container {
              padding: 1rem;
            }
            
            .page-header h1 {
              font-size: 1.8rem;
            }
            
            .subtitle {
              font-size: 1rem;
            }
            
            .tab-button {
              padding: 0.75rem 0.85rem;
              font-size: 0.9rem;
            }
            
            .view-container {
              padding: 1rem;
            }
            
            .new-appointment-container {
              margin-top: 1.5rem;
            }
          }
          
          @media (max-width: 480px) {
            .calendario-container {
              padding: 0.75rem;
            }
            
            .page-header h1 {
              font-size: 1.5rem;
            }
            
            .subtitle {
              font-size: 0.9rem;
            }
            
            .tab-button {
              padding: 0.6rem 0.7rem;
              font-size: 0.85rem;
            }
            
            .tab-icon {
              font-size: 1rem;
            }
            
            .view-container {
              padding: 0.75rem;
            }
          }
        `}</style>
      </div>
    </>
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