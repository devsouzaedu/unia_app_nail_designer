"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirecionar para strava-for com demo=true
    console.log('Redirecionando para /strava-for?demo=true');
    router.push('/strava-for?demo=true');
  }, [router]);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1>Redirecionando para Strava para Unhas...</h1>
      <p>Aguarde um momento...</p>
      <div style={{ 
        marginTop: '20px',
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #e62e69',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 