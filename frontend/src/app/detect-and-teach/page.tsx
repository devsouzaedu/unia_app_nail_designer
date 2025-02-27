"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function DetectAndTeachPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tutorial, setTutorial] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setTutorial("");
    setImages([]);

    if (!selectedFile) {
      setError("Por favor, selecione uma imagem.");
      return;
    }

    // Inicia a conversa: esconde o formulário e mostra somente a conversa
    setConversationStarted(true);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${backendUrl}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro na requisição.");
      }

      const data = await response.json();
      setTutorial(data.tutorial);
      setImages(data.images);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao processar a imagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Detect and Teach</h1>

      {!conversationStarted && (
        <>
          <p>
            Envie uma imagem de uma unha para que possamos detectar o tipo e gerar um tutorial detalhado.
          </p>
          <form onSubmit={handleSubmit} className="form">
            <label className="file-label">
              Selecione a imagem:
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
            </label>
            {selectedFile && (
              <p className="file-name">Selecionado: {selectedFile.name}</p>
            )}
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? <div className="spinner"></div> : "Enviar"}
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        </>
      )}

      {conversationStarted && (
        <div className="chat-container">
          {selectedFile && (
            <div className="chat-bubble user">
              <p>
                Você enviou a imagem: <strong>{selectedFile.name}</strong>
              </p>
            </div>
          )}

          {loading && (
            <div className="chat-bubble assistant">
              <p>Processando sua imagem...</p>
            </div>
          )}

          {tutorial && (
            <div className="chat-bubble assistant">
              <ReactMarkdown>{tutorial}</ReactMarkdown>
            </div>
          )}

          {images.length > 0 && (
            <div className="chat-bubble assistant images-bubble">
              <div className="image-list">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Imagem ${index + 1}`}
                    className="result-image"
                  />
                ))}
              </div>
            </div>
          )}

          {error && <p className="error">{error}</p>}
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');

        .container {
          background-color: #fdf4f9;
          color: #333;
          min-height: 100vh;
          padding: 2rem;
          font-family: 'Poppins', sans-serif;
        }
        h1 {
          text-align: center;
          font-size: 2.5rem;
          color: #e62e69;
          margin-bottom: 0.5rem;
        }
        p {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          max-width: 400px;
          margin: 0 auto 2rem;
        }
        .file-label {
          width: 100%;
          font-size: 1rem;
          display: flex;
          flex-direction: column;
        }
        .file-input {
          margin-top: 0.5rem;
          background: #fff;
          color: #333;
          border: 1px solid #e62e69;
          padding: 0.5rem;
          border-radius: 8px;
        }
        .file-name {
          font-size: 0.9rem;
          color: #555;
        }
        .submit-button {
          background: #e62e69;
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1rem;
          transition: background 0.3s ease;
          min-width: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .submit-button:hover:not(:disabled) {
          background: #d0225e;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border-left-color: #e62e69;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .error {
          color: red;
          text-align: center;
          margin-top: 1rem;
        }
        .chat-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .chat-bubble {
          max-width: 70%;
          padding: 1rem;
          border-radius: 16px;
          line-height: 1.4;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .chat-bubble.user {
          background-color: #e0e0e0;
          align-self: flex-end;
          border-bottom-right-radius: 0;
        }
        .chat-bubble.assistant {
          background-color: #fff;
          align-self: flex-start;
          border-bottom-left-radius: 0;
          border: 1px solid #e62e69;
        }
        .images-bubble {
          padding: 0.5rem;
        }
        .image-list {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .result-image {
          max-width: 300px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          animation: pop 0.5s ease-out;
        }
        @keyframes pop {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
