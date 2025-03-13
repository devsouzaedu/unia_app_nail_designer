// src/app/strava/page.tsx
"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function StravaPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  // Simulando carregamento
  setTimeout(() => {
    setIsLoading(false);
  }, 1000);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="auth-required">
        <h1>Acesso Restrito</h1>
        <p>Você precisa estar autenticado para acessar esta página.</p>
        <a href="/auth" className="auth-link">Fazer Login</a>
      </div>
    );
  }

  return (
    <div className="strava-container">
      <header className="page-header">
        <h1>Strava para Nail Designers</h1>
        <p className="subtitle">
          Acompanhe seu progresso, compartilhe seus designs e conecte-se com outros profissionais
        </p>
      </header>

      <div className="content-section">
        <div className="feature-card">
          <h2>Compartilhe seus Trabalhos</h2>
          <p>Publique fotos dos seus designs de unhas e receba feedback da comunidade.</p>
          <button className="action-button">Publicar Novo Design</button>
        </div>

        <div className="feature-card">
          <h2>Acompanhe seu Progresso</h2>
          <p>Veja estatísticas sobre seus designs, curtidas e seguidores.</p>
          <button className="action-button">Ver Estatísticas</button>
        </div>

        <div className="feature-card">
          <h2>Conecte-se</h2>
          <p>Encontre e siga outros nail designers para inspiração e networking.</p>
          <button className="action-button">Explorar Comunidade</button>
        </div>
      </div>

      <div className="coming-soon-banner">
        <h3>Novos recursos em breve!</h3>
        <p>Estamos trabalhando para trazer ainda mais funcionalidades para você.</p>
      </div>

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
        
        .content-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .feature-card {
          background-color: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .feature-card h2 {
          color: #e62e69;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .feature-card p {
          color: #666;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .action-button {
          background-color: #e62e69;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
          font-family: 'Inter', sans-serif;
        }
        
        .action-button:hover {
          background-color: #d0225e;
        }
        
        .coming-soon-banner {
          background: linear-gradient(135deg, #fff0f6 0%, #ffe3ec 100%);
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          margin-top: 2rem;
        }
        
        .coming-soon-banner h3 {
          color: #e62e69;
          margin-bottom: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .coming-soon-banner p {
          color: #666;
          font-family: 'Inter', sans-serif;
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
      `}</style>
    </div>
  );
}
