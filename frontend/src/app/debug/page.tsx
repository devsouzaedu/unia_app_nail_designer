"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Componente de carregamento para o Suspense
function Loading() {
  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh'
    }}>
      <div style={{
        padding: '2rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        Carregando...
      </div>
    </div>
  );
}

// Componente principal que usa useSearchParams
function DebugContent() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const paramsObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    setParams(paramsObj);
  }, [searchParams]);
  
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1>Página de Depuração</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Parâmetros de URL</h2>
        {Object.keys(params).length > 0 ? (
          <ul>
            {Object.entries(params).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum parâmetro encontrado</p>
        )}
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Links de Teste</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/debug?demo=true" style={linkStyle}>
            Testar com demo=true
          </Link>
          <Link href="/debug?demo=false" style={linkStyle}>
            Testar com demo=false
          </Link>
          <Link href="/debug?outro=valor" style={linkStyle}>
            Testar com outro parâmetro
          </Link>
          <Link href="/strava-for?demo=true" style={linkStyle}>
            Ir para Strava com demo=true
          </Link>
        </div>
      </div>
      
      <div>
        <h2>Informações do Navegador</h2>
        <p>User Agent: <span id="userAgent"></span></p>
        <p>Largura da Janela: <span id="windowWidth"></span>px</p>
        <p>Altura da Janela: <span id="windowHeight"></span>px</p>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('userAgent').textContent = navigator.userAgent;
          document.getElementById('windowWidth').textContent = window.innerWidth;
          document.getElementById('windowHeight').textContent = window.innerHeight;
        `
      }} />
    </div>
  );
}

// Componente principal da página envolvido em Suspense
export default function DebugPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DebugContent />
    </Suspense>
  );
}

const linkStyle = {
  padding: '0.75rem 1rem',
  backgroundColor: '#4a90e2',
  color: 'white',
  borderRadius: '4px',
  textDecoration: 'none',
  display: 'inline-block'
}; 