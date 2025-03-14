"use client";

import { FaSave, FaClock, FaUser, FaMoneyBillWave, FaCamera } from 'react-icons/fa';

interface SessionSummaryProps {
  session: any;
  onSaveSession: () => void;
}

export default function SessionSummary({ session, onSaveSession }: SessionSummaryProps) {
  // Formatar a duração para exibição
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} minutos`;
    }
  };
  
  return (
    <div className="session-summary">
      <div className="summary-header">
        <h2>Resumo do Atendimento</h2>
        <p>Atendimento finalizado com sucesso!</p>
      </div>
      
      <div className="summary-details">
        <div className="detail-item">
          <div className="detail-icon">
            <FaUser />
          </div>
          <div className="detail-content">
            <span className="detail-label">Cliente</span>
            <span className="detail-value">{session.clientName}</span>
          </div>
        </div>
        
        <div className="detail-item">
          <div className="detail-icon">
            <FaMoneyBillWave />
          </div>
          <div className="detail-content">
            <span className="detail-label">Valor</span>
            <span className="detail-value">R$ {parseFloat(session.value).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="detail-item">
          <div className="detail-icon">
            <FaClock />
          </div>
          <div className="detail-content">
            <span className="detail-label">Duração</span>
            <span className="detail-value">
              {session.formattedTime || formatDuration(session.duration)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="photos-comparison">
        <div className="photo-container">
          <h3>Antes</h3>
          <div className="photo">
            <img src={session.beforePhoto} alt="Antes do atendimento" />
          </div>
        </div>
        
        <div className="photo-container">
          <h3>Depois</h3>
          <div className="photo">
            <img src={session.afterPhoto} alt="Depois do atendimento" />
          </div>
        </div>
      </div>
      
      {session.progressPhotos && session.progressPhotos.length > 0 && (
        <div className="progress-photos">
          <h3>Fotos do Processo</h3>
          <div className="photos-grid">
            {session.progressPhotos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={photo} alt={`Foto do processo ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {session.notes && (
        <div className="notes-section">
          <h3>Notas</h3>
          <div className="notes-content">
            {session.notes}
          </div>
        </div>
      )}
      
      <button 
        type="button" 
        className="save-button" 
        onClick={onSaveSession}
      >
        <FaSave /> Salvar Atendimento
      </button>
      
      <style jsx>{`
        .session-summary {
          width: 100%;
        }
        
        .summary-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        h3 {
          color: #333;
          margin-bottom: 1rem;
        }
        
        .summary-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
        }
        
        .detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: #e62e69;
          color: white;
          border-radius: 50%;
          margin-right: 1rem;
        }
        
        .detail-content {
          display: flex;
          flex-direction: column;
        }
        
        .detail-label {
          font-size: 0.9rem;
          color: #666;
        }
        
        .detail-value {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
        }
        
        .photos-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .photo-container {
          text-align: center;
        }
        
        .photo {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .photo img {
          width: 100%;
          height: 300px;
          object-fit: cover;
        }
        
        .progress-photos {
          margin-bottom: 2rem;
        }
        
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }
        
        .photo-item {
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .photo-item img {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }
        
        .notes-section {
          margin-bottom: 2rem;
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 8px;
        }
        
        .notes-content {
          white-space: pre-wrap;
          color: #555;
          line-height: 1.5;
        }
        
        .save-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 1rem;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .save-button:hover {
          background-color: #43a047;
        }
        
        .save-button svg {
          margin-right: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .photos-comparison {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 