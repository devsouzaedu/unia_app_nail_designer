"use client";

import { useState, FormEvent } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { FaSave, FaRegClock, FaRegUserCircle, FaHandSparkles, FaCoins, FaRegCalendarAlt, FaRegStickyNote, FaCamera, FaPalette } from 'react-icons/fa';

// Tipos de serviços de manicure pré-definidos
const TIPOS_SERVICOS = [
  { id: 'manicure', nome: 'Manicure Simples', valorSugerido: 40 },
  { id: 'pedicure', nome: 'Pedicure Simples', valorSugerido: 50 },
  { id: 'unhasgel', nome: 'Unhas de Gel', valorSugerido: 80 },
  { id: 'spa', nome: 'SPA para Mãos', valorSugerido: 65 },
  { id: 'unhasacrilicas', nome: 'Unhas Acrílicas', valorSugerido: 120 },
  { id: 'alongamento', nome: 'Alongamento de Unhas', valorSugerido: 90 },
  { id: 'remoção', nome: 'Remoção de Unhas', valorSugerido: 35 },
  { id: 'decoracao', nome: 'Decoração de Unhas', valorSugerido: 25 },
  { id: 'combo', nome: 'Combo Mani e Pedi', valorSugerido: 80 },
  { id: 'outro', nome: 'Outro Serviço', valorSugerido: 0 }
];

interface NovoAgendamentoProps {
  userId: string;
  onAppointmentAdded: () => void;
}

export default function NovoAgendamento({ userId, onAppointmentAdded }: NovoAgendamentoProps) {
  const [clientName, setClientName] = useState('');
  const [service, setService] = useState('');
  const [customService, setCustomService] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#e62e69');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fotosReferencia, setFotosReferencia] = useState<string[]>([]);
  const [fotoRefURL, setFotoRefURL] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const abrirModalFotos = () => {
    setIsModalOpen(true);
  };
  
  const fecharModalFotos = () => {
    setIsModalOpen(false);
  };
  
  const adicionarFotoReferencia = () => {
    if (fotoRefURL && !fotosReferencia.includes(fotoRefURL)) {
      setFotosReferencia([...fotosReferencia, fotoRefURL]);
      setFotoRefURL('');
    }
  };
  
  const removerFotoReferencia = (url: string) => {
    setFotosReferencia(fotosReferencia.filter(foto => foto !== url));
  };

  const handleTipoServicoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const servicoSelecionado = e.target.value;
    setService(servicoSelecionado);
    
    // Se não for "outro", selecionar o valor sugerido
    if (servicoSelecionado !== 'outro') {
      const servicoInfo = TIPOS_SERVICOS.find(s => s.id === servicoSelecionado);
      if (servicoInfo) {
        setValue(servicoInfo.valorSugerido.toString());
        setCustomService(servicoInfo.nome);
      }
    } else {
      setCustomService('');
      setValue('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validações básicas
      if (!clientName.trim()) throw new Error('Nome da cliente é obrigatório');
      
      const serviceName = service === 'outro' ? customService : 
        TIPOS_SERVICOS.find(s => s.id === service)?.nome || '';
      
      if (!serviceName.trim()) throw new Error('Serviço é obrigatório');
      if (!value || parseFloat(value) <= 0) throw new Error('Valor deve ser maior que zero');
      if (!date) throw new Error('Data é obrigatória');
      if (!time) throw new Error('Horário é obrigatório');

      // Incluir as fotos de referência nas observações, se houver
      let notesWithPhotos = notes;
      if (fotosReferencia.length > 0) {
        notesWithPhotos += `\n\nFotos de referência:\n${fotosReferencia.join('\n')}`;
      }

      const appointmentData = {
        clientName,
        service: serviceName,
        value: parseFloat(value),
        date: new Date(`${date}T${time}`),
        time,
        userId,
        notes: notesWithPhotos,
        color: color
      };

      // Tentar até 3 vezes em caso de falha na conexão
      let retries = 0;
      const maxRetries = 3;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          await axios.post('https://calculator-for-nail-designers.onrender.com/api/appointments', appointmentData);
          success = true;
        } catch (err) {
          retries++;
          if (retries >= maxRetries) throw err;
          // Esperar um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Limpar o formulário
      setClientName('');
      setService('');
      setCustomService('');
      setValue('');
      setDate('');
      setTime('');
      setNotes('');
      setFotosReferencia([]);
      setColor('#e62e69');
      
      setSuccess('Agendamento adicionado com sucesso!');
      onAppointmentAdded();
    } catch (err: any) {
      console.error('Erro ao adicionar agendamento:', err);
      setError(err.message || 'Erro ao adicionar agendamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sugestões de horários comuns
  const horariosComuns = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  return (
    <div className="novo-agendamento-container">
      <style jsx global>{`
        input, textarea, select {
          font-size: 16px !important; /* Previne zoom no iOS */
        }
      `}</style>
      
      <div className="appointment-form">
        <h2><FaSave className="form-icon" /> Adicionar Novo Agendamento</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="clientName">
                <FaRegUserCircle className="input-icon" /> Nome da Cliente:
              </label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome da cliente"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="service">
                <FaHandSparkles className="input-icon" /> Tipo de Serviço:
              </label>
              <select
                id="service"
                value={service}
                onChange={handleTipoServicoChange}
                required
              >
                <option value="">Selecione um serviço</option>
                {TIPOS_SERVICOS.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome} {tipo.id !== 'outro' ? `(R$ ${tipo.valorSugerido.toFixed(2)})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {service === 'outro' && (
              <div className="form-group">
                <label htmlFor="customService">Nome do Serviço:</label>
                <input
                  type="text"
                  id="customService"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  placeholder="Descreva o serviço"
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="value">
                <FaCoins className="input-icon" /> Valor (R$):
              </label>
              <input
                type="number"
                id="value"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="date">
                <FaRegCalendarAlt className="input-icon" /> Data:
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="time">
                <FaRegClock className="input-icon" /> Horário:
              </label>
              <div className="time-input-container">
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
                <div className="quick-time-options">
                  {horariosComuns.map(h => (
                    <button 
                      type="button" 
                      key={h} 
                      className="time-option"
                      onClick={() => setTime(h)}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="color">
                <FaPalette className="input-icon" /> Cor para identificação:
              </label>
              <div className="color-picker">
                <input
                  type="color"
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <span className="color-preview" style={{ backgroundColor: color }}></span>
              </div>
            </div>
            
            <div className="form-group full-width">
              <div className="ref-photos-header">
                <label>
                  <FaCamera className="input-icon" /> Fotos de Referência:
                </label>
                <button 
                  type="button" 
                  onClick={abrirModalFotos}
                  className="add-photo-button"
                >
                  Adicionar Fotos
                </button>
              </div>
              
              {fotosReferencia.length > 0 && (
                <div className="photos-preview">
                  {fotosReferencia.map((url, index) => (
                    <div key={index} className="photo-item">
                      <img src={url} alt={`Referência ${index + 1}`} />
                      <button 
                        type="button" 
                        className="remove-photo"
                        onClick={() => removerFotoReferencia(url)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="notes">
                <FaRegStickyNote className="input-icon" /> Observações:
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes adicionais, preferências da cliente, etc."
              />
            </div>
          </div>
          
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Adicionando...' : 'Adicionar Agendamento'}
          </button>
        </form>
        
        {/* Modal para adicionar fotos de referência */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={fecharModalFotos}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Adicionar Foto de Referência</h3>
              <div className="photo-url-input">
                <input
                  type="text"
                  value={fotoRefURL}
                  onChange={(e) => setFotoRefURL(e.target.value)}
                  placeholder="Cole a URL da imagem"
                />
                <button 
                  type="button"
                  onClick={adicionarFotoReferencia}
                  disabled={!fotoRefURL}
                >
                  Adicionar
                </button>
              </div>
              
              <p className="photo-tip">
                Dica: Busque imagens de referência e copie o endereço da imagem para adicionar aqui.
              </p>
              
              <div className="modal-actions">
                <button 
                  type="button"
                  onClick={fecharModalFotos}
                  className="close-modal"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .appointment-form {
          background-color: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          color: #e62e69;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .form-icon {
          color: #e62e69;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .full-width {
          grid-column: span 2;
        }
        
        label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }
        
        .input-icon {
          color: #e62e69;
        }
        
        input, textarea, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s;
        }
        
        input:focus, textarea:focus, select:focus {
          border-color: #e62e69;
          outline: none;
        }
        
        textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        .time-input-container {
          position: relative;
        }
        
        .quick-time-options {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.5rem;
          margin-top: 0.5rem;
          max-height: 150px;
          overflow-y: auto;
        }
        
        .time-option {
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 0.4rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        
        .time-option:hover {
          background-color: #ffedf2;
          border-color: #e62e69;
        }
        
        .color-picker {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .color-preview {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid #ddd;
        }
        
        .ref-photos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .add-photo-button {
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        
        .add-photo-button:hover {
          background-color: #ffedf2;
          border-color: #e62e69;
        }
        
        .photos-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .photo-item {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #ddd;
        }
        
        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .remove-photo {
          position: absolute;
          top: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        
        .submit-button {
          background-color: #e62e69;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
          width: 100%;
          margin-top: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .submit-button:hover {
          background-color: #d0225e;
        }
        
        .submit-button:disabled {
          background-color: #f5a5c0;
          cursor: not-allowed;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .success-message {
          background-color: #e8f5e9;
          color: #2e7d32;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        /* Estilos do Modal */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          font-family: 'Inter', sans-serif;
        }
        
        .modal-content h3 {
          color: #e62e69;
          margin-top: 0;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
        }
        
        .photo-url-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .photo-url-input input {
          flex: 1;
        }
        
        .photo-url-input button {
          background-color: #e62e69;
          color: white;
          border: none;
          padding: 0 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        
        .photo-url-input button:disabled {
          background-color: #f5a5c0;
          cursor: not-allowed;
        }
        
        .photo-tip {
          font-size: 0.9rem;
          color: #666;
          font-style: italic;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .close-modal {
          background-color: #e0e0e0;
          color: #333;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
        }
        
        .close-modal:hover {
          background-color: #d5d5d5;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .full-width {
            grid-column: span 1;
          }
          
          .quick-time-options {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .form-group input,
          .form-group select,
          .form-group textarea {
            font-size: 16px; /* Previne zoom no iOS */
            -webkit-text-size-adjust: 100%;
          }
        }
      `}</style>
    </div>
  );
} 