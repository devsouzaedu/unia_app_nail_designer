"use client";

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaClock, FaCalendarAlt, FaUser, FaImage } from 'react-icons/fa';

interface SessionHistoryProps {
  userId: string;
  onBackToStart: () => void;
}

export default function SessionHistory({ userId, onBackToStart }: SessionHistoryProps) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [selectedSession, setSelectedSession] = useState<any>(null);
  
  // Função para lidar com erros de carregamento de imagens
  const handleImageError = (imageUrl: string) => {
    console.error(`Erro ao carregar imagem: ${imageUrl}`);
    setImageErrors(prev => ({
      ...prev,
      [imageUrl]: true
    }));
  };
  
  // Função para garantir que a URL da imagem seja absoluta
  const getAbsoluteImageUrl = (url: string) => {
    if (!url) return null;
    
    console.log('[DEBUG] Processando URL de imagem:', url);
    
    // Se a URL já for absoluta, retorna ela mesma
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('[DEBUG] URL já é absoluta');
      return url;
    }
    
    // Se a URL for relativa, adiciona o host da API
    const apiUrl = 'https://unia-cronometer.onrender.com';
    
    // Se a URL começar com /uploads, adiciona apenas o host
    if (url.startsWith('/uploads/')) {
      const absoluteUrl = `${apiUrl}${url}`;
      console.log('[DEBUG] URL convertida para absoluta (1):', absoluteUrl);
      return absoluteUrl;
    }
    
    // Se a URL não começar com /uploads, adiciona o host e o caminho /uploads/
    if (!url.includes('/uploads/')) {
      const absoluteUrl = `${apiUrl}/uploads/${url.split('/').pop()}`;
      console.log('[DEBUG] URL convertida para absoluta (2):', absoluteUrl);
      return absoluteUrl;
    }
    
    const absoluteUrl = `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    console.log('[DEBUG] URL convertida para absoluta (3):', absoluteUrl);
    return absoluteUrl;
  };
  
  // Função para selecionar uma sessão
  const handleSelectSession = (session: any) => {
    console.log('[DEBUG] Sessão selecionada:', session);
    setSelectedSession(session);
  };
  
  // Função para voltar à lista de sessões
  const handleBackToList = () => {
    setSelectedSession(null);
  };
  
  // Buscar as sessões do usuário
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        console.log('[DEBUG] Buscando sessões para o usuário:', userId);
        
        // Verificar se estamos no modo de demonstração (URL contém demo=true)
        const isDemoMode = window.location.href.includes('demo=true');
        console.log('[DEBUG] Modo de demonstração:', isDemoMode);
        
        if (isDemoMode) {
          // No modo de demonstração, usar dados simulados
          console.log('[DEBUG] Usando dados simulados para o modo de demonstração');
          
          // Criar algumas sessões simuladas
          const mockSessions = [
            {
              _id: 'demo1',
              clientName: 'Ana Silva',
              value: 120.00,
              startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias atrás
              endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
              duration: 7200, // 2 horas
              beforePhoto: '/gallery/img (1).png',
              afterPhoto: '/gallery/img (2).png',
              progressPhotos: ['/gallery/img (3).png'],
              notes: 'Cliente satisfeita com o resultado. Usamos técnica de nail art com flores.',
              userId: userId,
              completed: true
            },
            {
              _id: 'demo2',
              clientName: 'Mariana Oliveira',
              value: 150.00,
              startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
              endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(),
              duration: 9000, // 2.5 horas
              beforePhoto: '/gallery/img (4).png',
              afterPhoto: '/gallery/img (5).png',
              progressPhotos: ['/gallery/img (6).png', '/gallery/img (7).png'],
              notes: 'Aplicação de unhas em gel com decoração de pedras.',
              userId: userId,
              completed: true
            },
            {
              _id: 'demo3',
              clientName: 'Juliana Santos',
              value: 180.00,
              startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
              endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
              duration: 10800, // 3 horas
              beforePhoto: '/gallery/img (8).png',
              afterPhoto: '/gallery/img (1).png',
              progressPhotos: [],
              notes: 'Alongamento de unhas com técnica de fibra de vidro.',
              userId: userId,
              completed: true
            }
          ];
          
          console.log('[DEBUG] Sessões simuladas:', mockSessions);
          setSessions(mockSessions);
          setIsLoading(false);
          return;
        }
        
        // Se não estiver no modo de demonstração, fazer a requisição real
        const apiUrl = `https://unia-cronometer.onrender.com/api/strava/${userId}`;
        console.log('[DEBUG] URL da API:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('[DEBUG] Resposta da API:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error('Falha ao buscar sessões');
        }
        
        const data = await response.json();
        console.log('[DEBUG] Sessões recebidas:', data);
        console.log('[DEBUG] Total de sessões:', data.length);
        
        // Verificar se há sessões com o nome "Thaly"
        const thalySession = data.find((session: any) => 
          session.clientName && session.clientName.includes('Thaly')
        );
        console.log('[DEBUG] Sessão com nome Thaly encontrada:', thalySession ? 'Sim' : 'Não');
        
        // Processar as URLs das imagens para garantir que sejam absolutas
        const processedSessions = data.map((session: any) => ({
          ...session,
          beforePhoto: session.beforePhoto ? getAbsoluteImageUrl(session.beforePhoto) : null,
          afterPhoto: session.afterPhoto ? getAbsoluteImageUrl(session.afterPhoto) : null,
          progressPhotos: (session.progressPhotos || []).map((photo: string) => 
            photo ? getAbsoluteImageUrl(photo) : null
          )
        }));
        
        setSessions(processedSessions);
      } catch (err) {
        console.error('[DEBUG] Erro ao buscar sessões:', err);
        setError('Ocorreu um erro ao buscar o histórico de atendimentos.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, [userId]);
  
  // Formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Formatar a duração
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
    <div className="session-history">
      <div className="history-header">
        <button 
          type="button" 
          className="back-button" 
          onClick={selectedSession ? handleBackToList : onBackToStart}
        >
          <FaArrowLeft /> {selectedSession ? 'Voltar para lista' : 'Voltar'}
        </button>
        <h2>{selectedSession ? `Detalhes do Atendimento: ${selectedSession.clientName}` : 'Histórico de Atendimentos'}</h2>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="loading">Carregando histórico...</div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum atendimento registrado ainda.</p>
          <button 
            type="button" 
            className="start-new-button" 
            onClick={onBackToStart}
          >
            Iniciar Novo Atendimento
          </button>
        </div>
      ) : selectedSession ? (
        // Exibir detalhes da sessão selecionada
        <div className="session-detail">
          <div className="session-card">
            <div className="session-info">
              <div className="client-info">
                <div className="client-icon">
                  <FaUser />
                </div>
                <div className="client-details">
                  <span className="client-name">{selectedSession.clientName}</span>
                  <span className="session-value">R$ {parseFloat(selectedSession.value).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="session-meta">
                <div className="meta-item">
                  <FaCalendarAlt />
                  <span>{formatDate(selectedSession.startTime)}</span>
                </div>
                
                {selectedSession.duration && (
                  <div className="meta-item">
                    <FaClock />
                    <span>{formatDuration(selectedSession.duration)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="session-photos detail-photos">
              <div className="photo-container">
                <h3>Antes</h3>
                <div className="photo-large">
                  {!imageErrors[selectedSession.beforePhoto] && selectedSession.beforePhoto ? (
                    <img 
                      src={selectedSession.beforePhoto} 
                      alt="Antes" 
                      onError={() => handleImageError(selectedSession.beforePhoto)}
                    />
                  ) : (
                    <div className="photo-placeholder">
                      <FaImage />
                      <span>Imagem não disponível</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedSession.afterPhoto && (
                <div className="photo-container">
                  <h3>Depois</h3>
                  <div className="photo-large">
                    {!imageErrors[selectedSession.afterPhoto] ? (
                      <img 
                        src={selectedSession.afterPhoto} 
                        alt="Depois" 
                        onError={() => handleImageError(selectedSession.afterPhoto)}
                      />
                    ) : (
                      <div className="photo-placeholder">
                        <FaImage />
                        <span>Imagem não disponível</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {selectedSession.notes && (
              <div className="session-notes">
                <h3>Observações</h3>
                <p>{selectedSession.notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map((session: any) => (
            <div key={session._id} className="session-card clickable" onClick={() => handleSelectSession(session)}>
              <div className="session-info">
                <div className="client-info">
                  <div className="client-icon">
                    <FaUser />
                  </div>
                  <div className="client-details">
                    <span className="client-name">{session.clientName}</span>
                    <span className="session-value">R$ {parseFloat(session.value).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="session-meta">
                  <div className="meta-item">
                    <FaCalendarAlt />
                    <span>{formatDate(session.startTime)}</span>
                  </div>
                  
                  {session.duration && (
                    <div className="meta-item">
                      <FaClock />
                      <span>{formatDuration(session.duration)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="session-photos">
                <div className="photo-thumbnail">
                  {!imageErrors[session.beforePhoto] && session.beforePhoto ? (
                    <img 
                      src={session.beforePhoto} 
                      alt="Antes" 
                      onError={() => handleImageError(session.beforePhoto)}
                    />
                  ) : (
                    <div className="photo-placeholder">
                      <FaImage />
                      <span>Imagem não disponível</span>
                    </div>
                  )}
                  <span className="photo-label">Antes</span>
                </div>
                
                {session.afterPhoto && (
                  <div className="photo-thumbnail">
                    {!imageErrors[session.afterPhoto] ? (
                      <img 
                        src={session.afterPhoto} 
                        alt="Depois" 
                        onError={() => handleImageError(session.afterPhoto)}
                      />
                    ) : (
                      <div className="photo-placeholder">
                        <FaImage />
                        <span>Imagem não disponível</span>
                      </div>
                    )}
                    <span className="photo-label">Depois</span>
                  </div>
                )}
              </div>
              
              {session.notes && (
                <div className="session-notes">
                  <p>{session.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .session-history {
          width: 100%;
        }
        
        .history-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .back-button {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #555;
          transition: all 0.2s;
          margin-right: 1rem;
        }
        
        .back-button:hover {
          background-color: #eee;
          border-color: #ccc;
        }
        
        .back-button svg {
          margin-right: 0.5rem;
        }
        
        h2 {
          color: #333;
          margin: 0;
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          color: #666;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        
        .start-new-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #e62e69;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 1rem;
        }
        
        .start-new-button:hover {
          background-color: #d0225e;
        }
        
        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .session-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .session-info {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #eee;
        }
        
        .client-info {
          display: flex;
          align-items: center;
        }
        
        .client-icon {
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
        
        .client-details {
          display: flex;
          flex-direction: column;
        }
        
        .client-name {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
        }
        
        .session-value {
          font-size: 0.9rem;
          color: #666;
        }
        
        .session-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          color: #666;
          font-size: 0.9rem;
        }
        
        .meta-item svg {
          margin-right: 0.5rem;
          color: #888;
        }
        
        .session-photos {
          display: flex;
          padding: 1.5rem;
          gap: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .photo-thumbnail {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 4px;
          overflow: hidden;
          background-color: #f5f5f5;
        }
        
        .photo-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .photo-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: #f0f0f0;
          color: #999;
          font-size: 0.8rem;
          text-align: center;
          padding: 0.5rem;
        }
        
        .photo-placeholder svg {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .photo-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          text-align: center;
          padding: 0.25rem;
          font-size: 0.8rem;
        }
        
        .session-notes {
          padding: 1.5rem;
          color: #555;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        .session-notes p {
          margin: 0;
          white-space: pre-wrap;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        
        .clickable {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .session-detail {
          width: 100%;
        }
        
        .detail-photos {
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }
        
        .photo-container {
          width: 100%;
        }
        
        .photo-container h3 {
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .photo-large {
          width: 100%;
          height: 300px;
          border-radius: 8px;
          overflow: hidden;
          background-color: #f5f5f5;
        }
        
        .photo-large img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
} 