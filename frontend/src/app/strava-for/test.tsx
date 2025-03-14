"use client";

import { useState } from 'react';
import StartSession from './components/StartSession';

export default function TestPage() {
  const [sessionData, setSessionData] = useState(null);
  
  const handleSessionStarted = (data) => {
    console.log('Sessão iniciada:', data);
    setSessionData(data);
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Teste do Componente StartSession</h1>
      
      {sessionData ? (
        <div>
          <h2>Sessão Iniciada:</h2>
          <pre>{JSON.stringify(sessionData, null, 2)}</pre>
          <button onClick={() => setSessionData(null)}>Reiniciar</button>
        </div>
      ) : (
        <StartSession 
          userId="test-user" 
          onSessionStarted={handleSessionStarted} 
        />
      )}
    </div>
  );
} 