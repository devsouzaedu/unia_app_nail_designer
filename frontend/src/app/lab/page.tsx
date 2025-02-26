"use client";

import { useState, useEffect } from "react";

const loadingMessages = [
  "Carregando sua imagem",
  "Detectando Unhas",
  "Criando máscara",
  "Pintando",
  "Lixando",
  "Passando Hidratante nas suas unhas, quase lá",
];

export default function LabPage() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [testCount, setTestCount] = useState<number>(0);

  // NEXT_PUBLIC_UNIA3_URL deve apontar para a URL pública do backend.
  const backendUrl = process.env.NEXT_PUBLIC_UNIA3_URL || "";

  useEffect(() => {
    const storedCount = localStorage.getItem("testCount");
    if (storedCount) {
      setTestCount(Number(storedCount));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!file || !prompt) {
      alert("Por favor, selecione uma imagem e preencha o prompt.");
      return;
    }

    if (testCount >= 5) {
      alert("Você atingiu o limite de testes gratuitos. Por favor, assine um plano.");
      return;
    }

    console.log("Prompt enviado:", prompt);
    setLoading(true);
    setResult(null);
    setJobId(null);
    setJobStatus("");
    setLoadingMessage(loadingMessages[0]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);

    try {
      const res = await fetch(`${backendUrl}/enqueue`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.job_id) {
        setJobId(data.job_id);
        const newCount = testCount + 1;
        setTestCount(newCount);
        localStorage.setItem("testCount", newCount.toString());
      } else {
        alert("Erro ao enfileirar job: " + data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro ao enfileirar o job:", error);
      alert("Ocorreu um erro ao enfileirar o job.");
      setLoading(false);
    }
  };

  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    if (loading) {
      let index = 0;
      messageInterval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 5000);
    }
    return () => clearInterval(messageInterval);
  }, [loading]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${backendUrl}/job/${jobId}`);
          const data = await res.json();
          setJobStatus(data.status);
          if (data.status === "finished" && data.result) {
            setResult(data.result);
            clearInterval(interval);
            setLoading(false);
          }
        } catch (error) {
          console.error("Erro ao consultar o job:", error);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [jobId, backendUrl]);

  // Funções para compartilhamento (aqui usamos o URL da página atual como exemplo)
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=Confira essa unha gerada com IA: ${currentUrl}`,
      "_blank"
    );
  };
  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      "_blank"
    );
  };
  // Instagram não possui URL direta de compartilhamento, então podemos copiar o link
  const shareInstagram = () => {
    navigator.clipboard.writeText(currentUrl);
    alert("Link copiado para a área de transferência! Compartilhe no Instagram.");
  };

  return (
    <div className="container">
      <h1>Lab - Gerador de Unhas com IA</h1>
      <div className="form">
        <label className="file-label">
          Selecione a imagem da sua mão:
          <input type="file" onChange={handleFileChange} className="file-input" />
        </label>
        <label className="prompt-label">
          Descreva a ideia para a unha:
          <textarea
            placeholder="Digite seu prompt aqui..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="prompt-input"
          />
        </label>
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={loading || testCount >= 5}
        >
          {loading ? <div className="spinner"></div> : "Gerar unha editada"}
        </button>
      </div>
      {loading && (
        <>
          {jobStatus && <p className="status">Status do Job: {jobStatus}</p>}
          <p className="loading-message">{loadingMessage}</p>
        </>
      )}
      {result && (
        <div className="result">
          <h2>Resultado:</h2>
          <img
            className="result-image"
            src={`data:image/png;base64,${result}`}
            alt="Unha Editada"
          />
          <div className="share-buttons">
            <button className="share-button" onClick={shareWhatsApp}>
              Compartilhar no WhatsApp
            </button>
            <button className="share-button" onClick={shareInstagram}>
              Compartilhar no Instagram
            </button>
            <button className="share-button" onClick={shareFacebook}>
              Compartilhar no Facebook
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');

        .container {
          background-color: #fdf4f9;
          color: #333;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          font-family: 'Poppins', sans-serif;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          color: #e62e69;
        }
        .form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
          max-width: 400px;
          margin-bottom: 2rem;
        }
        .file-label,
        .prompt-label {
          width: 100%;
          font-size: 1rem;
          display: flex;
          flex-direction: column;
        }
        .file-input,
        .prompt-input {
          margin-top: 0.5rem;
          background: #fff;
          color: #333;
          border: 1px solid #e62e69;
          padding: 0.5rem;
          border-radius: 8px;
        }
        .prompt-input {
          height: 100px;
          padding: 0.75rem;
          resize: none;
        }
        .generate-button {
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
        .generate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .generate-button:hover:not(:disabled) {
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
        .status {
          margin-top: 1rem;
        }
        .loading-message {
          margin-top: 1rem;
          font-style: italic;
        }
        .result {
          margin-top: 2rem;
          text-align: center;
        }
        .result-image {
          max-width: 100%;
          border-radius: 8px;
          animation: pop 0.5s ease-out;
          margin-bottom: 1rem;
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
        .share-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .share-button {
          background: #e62e69;
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s ease;
        }
        .share-button:hover {
          background: #d0225e;
        }
      `}</style>
    </div>
  );
}
