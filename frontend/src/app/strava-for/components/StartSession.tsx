"use client";

import { useState, useRef } from 'react';
import { FaPlay, FaCamera, FaUpload } from 'react-icons/fa';

interface StartSessionProps {
  userId: string;
  onSessionStarted: (sessionData: any) => void;
}

export default function StartSession({ userId, onSessionStarted }: StartSessionProps) {
  const [clientName, setClientName] = useState('');
  const [value, setValue] = useState('');
  const [beforePhoto, setBeforePhoto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Função para abrir o seletor de arquivos
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Função para processar o arquivo selecionado
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    console.log('Arquivo selecionado:', file.name, file.type, file.size);
    
    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Verificar se estamos no modo de demonstração (URL contém demo=true)
      const isDemoMode = window.location.href.includes('demo=true');
      
      if (isDemoMode) {
        // No modo de demonstração, criar uma URL temporária para a imagem
        const imageUrl = URL.createObjectURL(file);
        setBeforePhoto(imageUrl);
        setIsLoading(false);
        return;
      }
      
      // Criar um FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('image', file);
      console.log('FormData criado com o arquivo:', file.name);
      
      // Usar diretamente a URL do microserviço no Render.com
      const apiUrl = `https://unia-cronometer.onrender.com/api/upload`;
      console.log('Enviando requisição para:', apiUrl);
      
      // Enviar para a API
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });
      
      console.log('Resposta recebida:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`Falha ao fazer upload da imagem: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      setBeforePhoto(data.imageUrl);
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      setError(`Ocorreu um erro ao fazer upload da imagem: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para iniciar a sessão
  const handleStartSession = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!clientName.trim()) {
      setError('Por favor, informe o nome da cliente');
      return;
    }
    
    if (!value || isNaN(parseFloat(value))) {
      setError('Por favor, informe um valor válido');
      return;
    }
    
    if (!beforePhoto) {
      setError('Por favor, tire uma foto antes de iniciar');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Criar objeto com os dados da sessão
      const sessionData = {
        clientName,
        value: parseFloat(value),
        beforePhoto,
        userId,
        startTime: new Date()
      };
      
      console.log('Dados da sessão a serem enviados:', sessionData);
      
      // Verificar se estamos no modo de demonstração (URL contém demo=true)
      const isDemoMode = window.location.href.includes('demo=true');
      
      if (isDemoMode) {
        // No modo de demonstração, simular uma resposta bem-sucedida
        console.log('Modo de demonstração detectado, simulando resposta');
        const mockSessionData = {
          _id: 's' + Date.now().toString(),
          ...sessionData,
          progressPhotos: [],
          completed: false
        };
        
        // Simular um pequeno atraso para parecer mais realista
        setTimeout(() => {
          console.log('Dados simulados:', mockSessionData);
          onSessionStarted(mockSessionData);
          setIsLoading(false);
        }, 500);
        
        return;
      }
      
      const apiUrl = `https://unia-cronometer.onrender.com/api/strava/start`;
      console.log('Enviando requisição para:', apiUrl);
      
      // Enviar para a API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
      
      console.log('Resposta recebida:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`Falha ao iniciar a sessão: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      onSessionStarted(data);
    } catch (err) {
      console.error('Erro ao iniciar sessão:', err);
      setError(`Ocorreu um erro ao iniciar a sessão: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="start-session">
      <div className="start-header">
        <h2>Iniciar Novo Atendimento</h2>
        <p>Preencha os dados abaixo para começar a registrar seu atendimento</p>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleStartSession}>
        <div className="form-group">
          <label htmlFor="clientName">Nome da Cliente</label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ex: Maria Silva"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="value">Valor do Serviço (R$)</label>
          <input
            type="number"
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex: 150.00"
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div className="photo-section">
          <label>Foto Antes do Serviço</label>
          
          {beforePhoto ? (
            <div className="photo-preview">
              <img src={beforePhoto} alt="Foto antes do serviço" />
              <button 
                type="button" 
                className="retake-photo" 
                onClick={() => setBeforePhoto('')}
              >
                Tirar Nova Foto
              </button>
            </div>
          ) : (
            <div className="upload-options">
              <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileUpload}
                capture="environment"
              />
              <button 
                type="button" 
                className="upload-photo" 
                onClick={handleFileSelect}
              >
                <FaCamera /> Tirar Foto / Selecionar Imagem
              </button>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="start-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando...' : (
            <>
              <FaPlay /> Iniciar Atendimento
            </>
          )}
        </button>
      </form>
      
      <style jsx>{`
        .start-session {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .start-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        form {
          width: 100%;
          max-width: 500px;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
        }
        
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .photo-section {
          margin-bottom: 2rem;
        }
        
        .upload-options {
          width: 100%;
        }
        
        .upload-tabs {
          display: flex;
          margin-bottom: 1rem;
        }
        
        .tab-button {
          flex: 1;
          padding: 0.5rem;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }
        
        .tab-button.active {
          background-color: #e62e69;
          color: white;
          border-color: #e62e69;
        }
        
        .tab-button svg {
          margin-right: 0.5rem;
        }
        
        .take-photo, .upload-photo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 1rem;
          background-color: #f5f5f5;
          border: 2px dashed #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          color: #555;
          transition: all 0.2s;
        }
        
        .take-photo:hover, .upload-photo:hover {
          background-color: #eee;
          border-color: #ccc;
        }
        
        .take-photo svg, .upload-photo svg {
          margin-right: 0.5rem;
        }
        
        .photo-preview {
          position: relative;
          margin-top: 1rem;
        }
        
        .photo-preview img {
          width: 100%;
          border-radius: 4px;
          max-height: 300px;
          object-fit: cover;
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
        
        .start-button {
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
        
        .start-button:hover {
          background-color: #d0225e;
        }
        
        .start-button:disabled {
          background-color: #f5a5b8;
          cursor: not-allowed;
        }
        
        .start-button svg {
          margin-right: 0.5rem;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          width: 100%;
          max-width: 500px;
          text-align: center;
        }
      `}</style>
    </div>
  );
} 