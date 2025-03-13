"use client";

import { useState } from 'react';
import AppointmentForm from '../calculator/components/AppointmentForm';
import AppointmentList from '../calculator/components/AppointmentList';
import EarningsStats from '../calculator/components/EarningsStats';

export default function DemoPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // ID de usuário fixo para o modo demo
  const userId = 'demo-user@example.com';

  const handleDataUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="calculator-container">
      <header className="page-header">
        <h1>Calculadora de Ganhos para Nail Designers</h1>
        <p className="subtitle">
          Gerencie seus agendamentos e acompanhe seus ganhos semanais e mensais
        </p>
        <div className="demo-badge">
          Modo Demonstração
        </div>
      </header>

      <div className="content-grid">
        <div className="form-section">
          <AppointmentForm 
            userId={userId} 
            onAppointmentAdded={handleDataUpdated} 
          />
        </div>
        
        <div className="stats-section">
          <EarningsStats 
            userId={userId} 
            refreshTrigger={refreshTrigger} 
          />
        </div>
      </div>
      
      <div className="view-section">
        <AppointmentList 
          userId={userId} 
          refreshTrigger={refreshTrigger} 
          onAppointmentUpdated={handleDataUpdated} 
        />
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .calculator-container {
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
          font-family: 'Inter', sans-serif;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1rem;
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
        
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .view-section {
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
} 