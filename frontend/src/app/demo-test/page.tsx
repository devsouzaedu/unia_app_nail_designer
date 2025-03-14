"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DemoTestPage() {
  const searchParams = useSearchParams();
  const demoParam = searchParams.get('demo');
  const isDemo = demoParam === 'true';
  
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1>Teste de Modo Demo</h1>
      
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2>Status do Modo Demo</h2>
        <p>
          <strong>Parâmetro demo:</strong> {demoParam || 'não definido'}
        </p>
        <p>
          <strong>isDemo:</strong> {isDemo ? 'true' : 'false'}
        </p>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Links de Teste</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/demo-test?demo=true" style={linkStyle('blue')}>
            Testar com demo=true
          </Link>
          <Link href="/demo-test?demo=false" style={linkStyle('red')}>
            Testar com demo=false
          </Link>
          <Link href="/demo-test" style={linkStyle('gray')}>
            Testar sem parâmetro demo
          </Link>
          <Link href="/strava-for?demo=true" style={linkStyle('green')}>
            Ir para Strava com demo=true
          </Link>
          <Link href="/" style={linkStyle('purple')}>
            Voltar para a página inicial
          </Link>
        </div>
      </div>
      
      <div style={{ 
        padding: '1rem', 
        backgroundColor: isDemo ? '#e8f5e9' : '#ffebee', 
        borderRadius: '8px',
        marginTop: '2rem'
      }}>
        <h2>{isDemo ? 'Modo Demo Ativado' : 'Modo Demo Desativado'}</h2>
        <p>
          {isDemo 
            ? 'Você está no modo de demonstração. Todas as funcionalidades estão disponíveis sem necessidade de login.' 
            : 'O modo de demonstração não está ativo. Algumas funcionalidades podem exigir autenticação.'}
        </p>
      </div>
    </div>
  );
}

function linkStyle(color: string) {
  const colors = {
    blue: { bg: '#4a90e2', hover: '#3a7bc8' },
    red: { bg: '#e53935', hover: '#c62828' },
    green: { bg: '#43a047', hover: '#388e3c' },
    purple: { bg: '#9c27b0', hover: '#7b1fa2' },
    gray: { bg: '#757575', hover: '#616161' }
  };
  
  const selectedColor = colors[color] || colors.blue;
  
  return {
    padding: '0.75rem 1rem',
    backgroundColor: selectedColor.bg,
    color: 'white',
    borderRadius: '4px',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: selectedColor.hover
    }
  };
} 