"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
        }
      `}</style>
    </div>
  );
}

// Componente principal que usa useSearchParams
function StravaSimpleContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoParam = searchParams.get('demo');
  const isDemo = demoParam === 'true';
  
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Se ainda estiver carregando, mostrar indicador
  if (status === 'loading' || isLoading) {
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
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Strava Simplificado</h1>
        <p style={styles.subtitle}>
          Versão simplificada para teste do modo demo
        </p>
        {isDemo && (
          <div style={styles.demoBadge}>
            Modo Demonstração
          </div>
        )}
      </header>

      <div style={styles.content}>
        <h2>Acesso Concedido!</h2>
        <p>
          {session 
            ? `Você está logado como ${session.user?.email || 'usuário autenticado'}.` 
            : 'Você está acessando no modo demonstração.'}
        </p>
        
        <div style={styles.infoBox}>
          <h3>Informações de Depuração</h3>
          <ul>
            <li><strong>Status da sessão:</strong> {status}</li>
            <li><strong>Parâmetro demo:</strong> {demoParam || 'não definido'}</li>
            <li><strong>isDemo:</strong> {isDemo ? 'true' : 'false'}</li>
            <li><strong>Usuário:</strong> {session?.user?.email || 'não autenticado'}</li>
          </ul>
        </div>
        
        <div style={styles.buttonContainer}>
          <Link href="/" style={styles.button}>
            Voltar para a página inicial
          </Link>
          <Link href="/demo-test" style={{...styles.button, backgroundColor: '#ff9800'}}>
            Ir para Teste de Demo
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente principal da página envolvido em Suspense
export default function StravaSimplePage() {
  return (
    <Suspense fallback={<Loading />}>
      <StravaSimpleContent />
    </Suspense>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'Inter, sans-serif'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
    position: 'relative' as const
  },
  title: {
    color: '#e62e69',
    fontSize: '2rem',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#666',
    fontSize: '1.1rem'
  },
  demoBadge: {
    position: 'absolute' as const,
    top: '-10px',
    right: '0',
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    padding: '2rem'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh'
  },
  loadingBox: {
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    textAlign: 'center' as const
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '2rem',
    marginBottom: '2rem'
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem'
  },
  button: {
    backgroundColor: '#4a90e2',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    textDecoration: 'none',
    display: 'inline-block'
  }
}; 