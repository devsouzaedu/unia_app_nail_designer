"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaPlay, FaHistory, FaChartBar } from 'react-icons/fa';

// Importar os componentes
import StartSession from './components/StartSession';
import ActiveSession from './components/ActiveSession';
import SessionSummary from './components/SessionSummary';
import SessionHistory from './components/SessionHistory';

// Componente de carregamento para o Suspense
function Loading() {
  return (
    <div className="loading-container">
      <div className="loading">Carregando...</div>
    </div>
  );
}

// Componente principal que usa useSearchParams
function StravaForNailsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoParam = searchParams.get('demo');
  const isDemo = demoParam === 'true';
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para controlar o fluxo da aplicação
  const [currentStep, setCurrentStep] = useState('home'); // 'home', 'start', 'active', 'finish', 'history'
  const [activeSession, setActiveSession] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);
  
  // Log para depuração
  useEffect(() => {
    console.log('Status da sessão:', status);
    console.log('Parâmetro demo:', demoParam);
    console.log('isDemo:', isDemo);
  }, [status, demoParam, isDemo]);
  
  // Verificar autenticação
  useEffect(() => {
    if (status !== 'loading') {
      if (session || isDemo) {
        setIsLoading(false);
      } else {
        router.push('/auth');
      }
    }
  }, [session, status, isDemo, router]);
  
  // Funções para controlar o fluxo da aplicação
  const startNewSession = () => {
    setCurrentStep('start');
    setActiveSession(null);
    setCompletedSession(null);
  };
  
  const startSession = (sessionData) => {
    setActiveSession(sessionData);
    setCurrentStep('active');
  };
  
  const completeSession = (sessionData) => {
    setCompletedSession(sessionData);
    setActiveSession(null);
    setCurrentStep('finish');
  };
  
  const viewHistory = () => {
    setCurrentStep('history');
  };
  
  const goHome = () => {
    setCurrentStep('home');
  };
  
  // Se ainda estiver carregando, mostrar indicador
  if (status === 'loading' || isLoading) {
    return (
      <div className="loading-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }
  
  // Usar o email como identificador único do usuário ou um ID demo
  const userId = session?.user?.email || 'demo-user@example.com';
  
  return (
    <div className="strava-container">
      <header className="page-header">
        <h1>Strava para Nail Designers</h1>
        <p className="subtitle">
          Acompanhe seus atendimentos, registre fotos e calcule seus ganhos
        </p>
        {isDemo && (
          <div className="demo-badge">
            Modo Demonstração
          </div>
        )}
      </header>
      
      {currentStep === 'home' && (
        <div className="home-screen">
          <div className="action-buttons">
            <button className="action-button start" onClick={startNewSession}>
              <FaPlay />
              <span>Iniciar Atendimento</span>
            </button>
            
            <button className="action-button history" onClick={viewHistory}>
              <FaHistory />
              <span>Histórico</span>
            </button>
            
            <Link href="/calculator" className="action-button stats">
              <FaChartBar />
              <span>Calculadora de Ganhos</span>
            </Link>
          </div>
        </div>
      )}
      
      {currentStep === 'start' && (
        <StartSession 
          userId={userId} 
          onSessionStarted={startSession} 
        />
      )}
      
      {currentStep === 'active' && activeSession && (
        <ActiveSession 
          session={activeSession} 
          onSessionFinished={completeSession} 
        />
      )}
      
      {currentStep === 'finish' && completedSession && (
        <SessionSummary 
          session={completedSession} 
          onSaveSession={goHome} 
        />
      )}
      
      {currentStep === 'history' && (
        <SessionHistory 
          userId={userId} 
          onBackToStart={goHome} 
        />
      )}
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .strava-container {
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
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1rem;
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
        }
        
        .home-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 0;
        }
        
        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          width: 100%;
          max-width: 800px;
        }
        
        .action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          border-radius: 8px;
          background-color: #fff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
          color: inherit;
        }
        
        .action-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        
        .action-button svg {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        
        .action-button span {
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .action-button.start {
          background-color: #e62e69;
          color: white;
        }
        
        .action-button.history {
          background-color: #f5f5f5;
          color: #333;
        }
        
        .action-button.stats {
          background-color: #f5f5f5;
          color: #333;
        }
      `}</style>
    </div>
  );
}

// Componente principal da página envolvido em Suspense
export default function StravaForNailsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <StravaForNailsContent />
    </Suspense>
  );
} 