"use client";

import { useState, useEffect, useRef } from 'react';
import { FaCamera, FaCheck, FaArrowRight } from 'react-icons/fa';

interface ActiveSessionProps {
  session: any;
  onSessionFinished: (sessionData: any) => void;
}

export default function ActiveSession({ session: initialSession, onSessionFinished }: ActiveSessionProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [afterPhoto, setAfterPhoto] = useState('');
  const [notes, setNotes] = useState(initialSession.notes || '');
  const [error, setError] = useState('');
  const [session, setSession] = useState(initialSession);
  const [progressPhotos, setProgressPhotos] = useState<string[]>(initialSession.progressPhotos || []);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date>(new Date(initialSession.startTime));
  
  // Iniciar o timer quando o componente é montado
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
      setElapsedTime(diff);
    }, 1000);
    
    // Limpar o timer quando o componente é desmontado
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Formatar o tempo decorrido
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Função para adicionar uma foto durante o processo
  const handleAddPhoto = async () => {
    try {
      // Verificar se estamos no modo de demonstração (URL contém demo=true)
      const isDemoMode = window.location.href.includes('demo=true');
      
      // Abrir um seletor de arquivos
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Permite acesso à câmera em dispositivos móveis
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        if (isDemoMode) {
          // No modo de demonstração, criar uma URL temporária para a imagem
          const imageUrl = URL.createObjectURL(file);
          
          // Atualizar o estado local
          const updatedPhotos = [...progressPhotos, imageUrl];
          setProgressPhotos(updatedPhotos);
          
          // Atualizar o estado da sessão
          setSession({
            ...session,
            progressPhotos: updatedPhotos
          });
          
          return;
        }
        
        // Criar um FormData para enviar o arquivo
        const formData = new FormData();
        formData.append('image', file);
        
        // Fazer upload da imagem
        const uploadResponse = await fetch(`https://unia-cronometer.onrender.com/api/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Falha ao fazer upload da imagem');
        }
        
        const uploadData = await uploadResponse.json();
        const photoUrl = uploadData.imageUrl;
        
        // Adicionar a foto à sessão
        const response = await fetch(`https://unia-cronometer.onrender.com/api/strava/add-photo/${session._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ photoUrl })
        });
        
        if (!response.ok) {
          throw new Error('Falha ao adicionar foto à sessão');
        }
        
        const data = await response.json();
        setProgressPhotos(data.progressPhotos);
      };
      
      input.click();
    } catch (err) {
      console.error('Erro ao adicionar foto:', err);
      setError('Ocorreu um erro ao adicionar a foto. Tente novamente.');
    }
  };
  
  // Função para atualizar as notas
  const handleUpdateNotes = async () => {
    try {
      // Verificar se estamos no modo de demonstração (URL contém demo=true)
      const isDemoMode = window.location.href.includes('demo=true');
      
      if (isDemoMode) {
        // No modo de demonstração, simular uma resposta bem-sucedida
        console.log('Modo de demonstração detectado, simulando atualização de notas');
        // Atualizar o estado local apenas
        setSession({
          ...session,
          notes
        });
        return; // Retornar aqui para evitar a execução do restante da função
      }
      
      const response = await fetch(`https://unia-cronometer.onrender.com/api/strava/notes/${session._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar notas');
      }
      
      // Atualizar o estado local após sucesso na API
      setSession({
        ...session,
        notes
      });
    } catch (err) {
      console.error('Erro ao atualizar notas:', err);
      setError('Ocorreu um erro ao salvar as notas. Tente novamente.');
    }
  };
  
  // Função para fazer upload da foto final
  const handleFinalPhoto = async () => {
    try {
      // Verificar se estamos no modo de demonstração (URL contém demo=true)
      const isDemoMode = window.location.href.includes('demo=true');
      
      // Abrir um seletor de arquivos
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Permite acesso à câmera em dispositivos móveis
      
      // Criar uma promessa para aguardar a seleção do arquivo
      const filePromise = new Promise<File | null>((resolve) => {
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            resolve(files[0]);
          } else {
            resolve(null);
          }
        };
        
        // Se o usuário cancelar, resolver com null
        input.oncancel = () => resolve(null);
      });
      
      // Disparar o clique no input
      input.click();
      
      // Aguardar a seleção do arquivo
      const file = await filePromise;
      if (!file) return;
      
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido');
        return;
      }
      
      if (isDemoMode) {
        // No modo de demonstração, criar uma URL temporária para a imagem
        const imageUrl = URL.createObjectURL(file);
        setAfterPhoto(imageUrl);
        return;
      }
      
      // Criar um FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('image', file);
      
      // Enviar para a API
      const uploadResponse = await fetch(`https://unia-cronometer.onrender.com/api/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Falha ao fazer upload da imagem');
      }
      
      const uploadData = await uploadResponse.json();
      setAfterPhoto(uploadData.imageUrl);
    } catch (err) {
      console.error('Erro ao fazer upload da imagem final:', err);
      setError('Ocorreu um erro ao fazer upload da imagem final. Tente novamente.');
    }
  };
  
  // Função para finalizar a sessão
  const handleFinishSession = async () => {
    if (!afterPhoto) {
      setError('Por favor, tire uma foto do resultado final');
      return;
    }
    
    setError('');
    
    try {
      // Parar o timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Verificar se estamos no modo de demonstração (URL contém demo=true)
      const isDemoMode = window.location.href.includes('demo=true');
      
      if (isDemoMode) {
        // No modo de demonstração, simular uma resposta bem-sucedida
        console.log('Modo de demonstração detectado, simulando finalização de sessão');
        
        const endTime = new Date();
        const startTime = new Date(session.startTime);
        const durationInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        
        const completedSession = {
          ...session,
          endTime,
          duration: durationInSeconds,
          afterPhoto,
          notes,
          completed: true
        };
        
        // Simular um pequeno atraso para parecer mais realista
        setTimeout(() => {
          onSessionFinished(completedSession);
        }, 500);
        
        return; // Retornar aqui para evitar a execução do restante da função
      }
      
      // Enviar para a API
      const response = await fetch(`https://unia-cronometer.onrender.com/api/strava/finish/${session._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          afterPhoto,
          notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Resposta de erro:', errorData);
        throw new Error('Falha ao finalizar sessão');
      }
      
      const data = await response.json();
      onSessionFinished(data);
    } catch (err) {
      console.error('Erro ao finalizar sessão:', err);
      setError('Ocorreu um erro ao finalizar a sessão. Tente novamente.');
    }
  };
  
  // Função para iniciar o processo de finalização
  const handleStartFinishing = () => {
    try {
      // Salvar as notas antes de iniciar o processo de finalização
      handleUpdateNotes();
      setIsFinishing(true);
    } catch (err) {
      console.error('Erro ao iniciar processo de finalização:', err);
      // Mesmo se houver erro, vamos continuar com o processo de finalização
      setIsFinishing(true);
    }
  };
  
  return (
    <div className="active-session">
      {!isFinishing ? (
        <>
          <div className="session-header">
            <h2>Atendimento em Andamento</h2>
            <p>Cliente: <strong>{session.clientName}</strong></p>
            <p>Valor: <strong>R$ {parseFloat(session.value).toFixed(2)}</strong></p>
          </div>
          
          <div className="timer-container">
            <div className="timer">{formatTime(elapsedTime)}</div>
            <p className="timer-label">Tempo de Atendimento</p>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="notes-section">
            <label htmlFor="notes">Notas sobre o Atendimento</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o atendimento..."
              rows={4}
              onBlur={handleUpdateNotes}
            />
          </div>
          
          <div className="photos-section">
            <div className="photos-header">
              <h3>Fotos do Processo</h3>
              <button 
                type="button" 
                className="add-photo-button" 
                onClick={handleAddPhoto}
              >
                <FaCamera /> Adicionar Foto
              </button>
            </div>
            
            <div className="photos-grid">
              {progressPhotos.length > 0 ? (
                progressPhotos.map((photo, index) => (
                  <div key={index} className="photo-item">
                    <img src={photo} alt={`Foto do processo ${index + 1}`} />
                  </div>
                ))
              ) : (
                <p className="no-photos">Nenhuma foto adicionada ainda</p>
              )}
            </div>
          </div>
          
          <button 
            type="button" 
            className="finish-button" 
            onClick={handleStartFinishing}
          >
            <FaArrowRight /> Finalizar Atendimento
          </button>
        </>
      ) : (
        <div className="finish-section">
          <h2>Finalizar Atendimento</h2>
          <p>Tire uma foto do resultado final para concluir o atendimento</p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="final-photo-section">
            {afterPhoto ? (
              <div className="photo-preview">
                <img src={afterPhoto} alt="Resultado final" />
                <button 
                  type="button" 
                  className="retake-photo" 
                  onClick={() => setAfterPhoto('')}
                >
                  Tirar Nova Foto
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                className="take-photo" 
                onClick={handleFinalPhoto}
              >
                <FaCamera /> Tirar Foto do Resultado Final
              </button>
            )}
          </div>
          
          <div className="finish-actions">
            <button 
              type="button" 
              className="back-button" 
              onClick={() => setIsFinishing(false)}
            >
              Voltar
            </button>
            
            <button 
              type="button" 
              className="complete-button" 
              onClick={handleFinishSession}
              disabled={!afterPhoto}
            >
              <FaCheck /> Concluir Atendimento
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .active-session {
          width: 100%;
        }
        
        .session-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .timer-container {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .timer {
          font-size: 3rem;
          font-weight: 700;
          color: #e62e69;
          font-family: monospace;
        }
        
        .timer-label {
          color: #666;
          margin-top: 0.5rem;
        }
        
        .notes-section {
          margin-bottom: 2rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
        }
        
        textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          resize: vertical;
        }
        
        .photos-section {
          margin-bottom: 2rem;
        }
        
        .photos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        h3 {
          color: #333;
          margin: 0;
        }
        
        .add-photo-button {
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
        }
        
        .add-photo-button:hover {
          background-color: #eee;
          border-color: #ccc;
        }
        
        .add-photo-button svg {
          margin-right: 0.5rem;
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
        
        .no-photos {
          color: #888;
          text-align: center;
          padding: 2rem;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        
        .finish-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 1rem;
          background-color: #e62e69;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .finish-button:hover {
          background-color: #d0225e;
        }
        
        .finish-button svg {
          margin-right: 0.5rem;
        }
        
        .finish-section {
          text-align: center;
        }
        
        .final-photo-section {
          margin: 2rem 0;
        }
        
        .take-photo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 1.5rem;
          background-color: #f5f5f5;
          border: 2px dashed #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1.1rem;
          color: #555;
          transition: all 0.2s;
        }
        
        .take-photo:hover {
          background-color: #eee;
          border-color: #ccc;
        }
        
        .take-photo svg {
          margin-right: 0.5rem;
        }
        
        .photo-preview {
          position: relative;
          margin-top: 1rem;
        }
        
        .photo-preview img {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .retake-photo {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .finish-actions {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .back-button {
          flex: 1;
          padding: 1rem;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          color: #555;
          transition: all 0.2s;
        }
        
        .back-button:hover {
          background-color: #eee;
          border-color: #ccc;
        }
        
        .complete-button {
          flex: 2;
          display: flex;
          align-items: center;
          justify-content: center;
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
        
        .complete-button:hover {
          background-color: #43a047;
        }
        
        .complete-button:disabled {
          background-color: #a5d6a7;
          cursor: not-allowed;
        }
        
        .complete-button svg {
          margin-right: 0.5rem;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
} 