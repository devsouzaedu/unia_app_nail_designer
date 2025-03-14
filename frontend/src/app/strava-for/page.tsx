"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaPlay, FaHistory, FaChartBar } from 'react-icons/fa';

// Importar os componentes
import StartSession from './components/StartSession';
import ActiveSession from './components/ActiveSession';
import SessionSummary from './components/SessionSummary';
import SessionHistory from './components/SessionHistory';

export default function StravaForNailsPage() {
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
    console.log('Estado atual do currentStep:', currentStep);
    
    // Verificar se o usuário está autenticado ou se está no modo demo
    if (status !== 'loading') {
      console.log('Status não está carregando. Session:', !!session, 'isDemo:', isDemo);
      
      // Se o usuário estiver autenticado ou estiver no modo demo, permitir acesso
      if (session || isDemo) {
        console.log('Acesso permitido: usuário autenticado ou modo demo');
        setTimeout(() => {
          setIsLoading(false);
          console.log('Loading definido como false');
        }, 500);
      } else {
        console.log('Acesso negado: redirecionando para autenticação');
        // Redirecionar para a página de autenticação se não estiver autenticado e não for demo
        router.push('/auth?redirectTo=/strava-for');
      }
    }
  }, [session, status, isDemo, router, demoParam, currentStep]);

  // Efeito para monitorar mudanças no currentStep
  useEffect(() => {
    console.log('currentStep mudou para:', currentStep);
  }, [currentStep]);

  // Função para iniciar um novo atendimento
  const handleStartSession = () => {
    console.log('Botão Iniciar Atendimento clicado');
    console.log('Estado atual:', currentStep);
    setCurrentStep('start');
    console.log('Novo estado:', 'start');
  };

  // Função para lidar com o início de uma sessão
  const handleSessionStarted = (sessionData) => {
    console.log('Sessão iniciada:', sessionData);
    setActiveSession(sessionData);
    setCurrentStep('active');
  };

  // Função para lidar com a finalização de uma sessão
  const handleSessionFinished = (sessionData) => {
    console.log('Sessão finalizada:', sessionData);
    setCompletedSession(sessionData);
    setCurrentStep('summary');
  };

  // Função para salvar a sessão e voltar para a tela inicial
  const handleSaveSession = async () => {
    try {
      console.log('Salvando sessão no histórico...');
      
      // Verificar se estamos no modo de demonstração
      if (isDemo) {
        console.log('Modo de demonstração detectado, a sessão já foi salva automaticamente');
        // No modo de demonstração, a sessão já foi salva automaticamente quando foi finalizada
        // Não precisamos fazer nada aqui
      } else {
        // Em um ambiente real, poderíamos fazer uma chamada adicional para garantir que a sessão foi salva
        // Por exemplo, atualizar algum campo adicional na sessão
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/strava/session/${completedSession._id}`, {
          method: 'GET'
        });
        
        if (!response.ok) {
          throw new Error('Falha ao verificar a sessão');
        }
        
        console.log('Sessão verificada com sucesso');
      }
      
      console.log('Sessão salva com sucesso!');
      // Limpar os estados e voltar para a tela inicial
      setActiveSession(null);
      setCompletedSession(null);
      setCurrentStep('home');
    } catch (err) {
      console.error('Erro ao salvar sessão:', err);
      // Mesmo se houver erro, vamos voltar para a tela inicial
      setActiveSession(null);
      setCompletedSession(null);
      setCurrentStep('home');
    }
  };

  // Função para ver o histórico
  const handleViewHistory = () => {
    setCurrentStep('history');
  };

  // Função para voltar para a tela inicial
  const handleBackToStart = () => {
    setCurrentStep('home');
  };

  // Efeito para monitorar a renderização
  useEffect(() => {
    console.log('Renderizando componente, currentStep:', currentStep);
    console.log('isLoading:', isLoading);
  });

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
    <div className="strava-container">
      <header className="page-header">
        <h1>Strava para Nail Designers</h1>
        <p className="subtitle">
          Registre seus atendimentos, acompanhe o tempo e documente o processo com fotos
        </p>
        {isDemo && (
          <div className="demo-badge">
            Modo Demonstração
          </div>
        )}
      </header>

      <div className="content-area">
        {currentStep === 'home' && (
          <div className="home-screen">
            <div className="feature-card main-card">
              <h2>Iniciar Novo Atendimento</h2>
              <p>Registre informações sobre o cliente e o serviço a ser realizado.</p>
              <button className="action-button big-button" onClick={() => {
                console.log('Clique no botão detectado');
                handleStartSession();
              }}>
                <FaPlay /> Iniciar Atendimento
              </button>
            </div>
            
            <div className="feature-card">
              <h2>Histórico de Atendimentos</h2>
              <p>Visualize todos os atendimentos realizados anteriormente.</p>
              <button className="action-button" onClick={handleViewHistory}>
                <FaHistory /> Ver Histórico
              </button>
            </div>
            
            <div className="feature-card">
              <h2>Estatísticas</h2>
              <p>Acompanhe seu desempenho e ganhos ao longo do tempo.</p>
              <button className="action-button">
                <FaChartBar /> Ver Estatísticas
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 'start' && (
          <StartSession 
            userId={userId} 
            onSessionStarted={handleSessionStarted} 
          />
        )}
        
        {currentStep === 'active' && activeSession && (
          <ActiveSession 
            session={activeSession} 
            onSessionFinished={handleSessionFinished} 
          />
        )}
        
        {currentStep === 'summary' && completedSession && (
          <SessionSummary 
            session={completedSession} 
            onSaveSession={handleSaveSession} 
          />
        )}
        
        {currentStep === 'history' && (
          <SessionHistory 
            userId={userId} 
            onBackToStart={handleBackToStart} 
          />
        )}
      </div>

      <style jsx>{`
        .strava-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
        }
        
        h1 {
          color: #e62e69;
          margin-bottom: 0.5rem;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1rem;
        }
        
        .demo-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #ff9800;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .content-area {
          width: 100%;
        }
        
        .home-screen {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .feature-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          text-align: center;
          transition: transform 0.2s;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
        }
        
        .main-card {
          grid-column: 1 / -1;
          background-color: #f9f9f9;
          border: 2px solid #e62e69;
        }
        
        .feature-card h2 {
          color: #333;
          margin-bottom: 1rem;
        }
        
        .feature-card p {
          color: #666;
          margin-bottom: 1.5rem;
        }
        
        .action-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background-color: #e62e69;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .action-button:hover {
          background-color: #d0225e;
        }
        
        .action-button svg {
          margin-right: 0.5rem;
        }
        
        .big-button {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
        }
        
        .loading {
          padding: 1rem 2rem;
          background-color: #f5f5f5;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          color: #666;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
} 