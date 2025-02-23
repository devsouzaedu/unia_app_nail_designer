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

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [testCount, setTestCount] = useState<number>(0);

  // A variável de ambiente NEXT_PUBLIC_UNIA3_URL deve apontar para a URL pública do backend.
  const backendUrl = process.env.NEXT_PUBLIC_UNIA3_URL || "";

  // Carrega o número de testes já realizados do localStorage, se existir.
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

    // Verifica se o limite de testes foi atingido (3 testes)
    if (testCount >= 3) {
      alert("Você atingiu o limite de 3 testes. Clique no link para saber mais.");
      return;
    }

    console.log("Prompt enviado:", prompt);

    setLoading(true);
    setResult(null);
    setJobId(null);
    setJobStatus("");
    setLoadingMessage(loadingMessages[0]);

    // Cria o FormData para enviar os dados para o backend
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
        // Incrementa o contador de testes e salva no localStorage
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

  // Atualiza a mensagem de carregamento a cada 5 segundos enquanto estiver carregando
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

  // Implementa polling para consultar o status do job a cada 5 segundos
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

  return (
    <div className="container">
      <h1>
        Unia.app - V1.00.02 <span className="beta">Beta</span>
      </h1>
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
          disabled={loading || testCount >= 3}
        >
          {loading ? <div className="spinner"></div> : "Gerar unha editada"}
        </button>
        {testCount >= 3 && (
          <p className="limit-msg">
            Você atingiu o limite de 3 testes.{" "}
            <a href="https://seulink.com/saibamais" target="_blank" rel="noopener noreferrer">
              Saiba mais
            </a>
          </p>
        )}
      </div>
      {loading && (
        <>
          {jobStatus && <p style={{ marginTop: "1rem" }}>Status do Job: {jobStatus}</p>}
          <p style={{ marginTop: "1rem" }}>{loadingMessage}</p>
        </>
      )}
      {result && (
        <div className="result">
          <h2>Resultado:</h2>
          <img src={`data:image/png;base64,${result}`} alt="Unha Editada" />
        </div>
      )}
      <style jsx>{`
        .container {
          background-color: #1e1e2f;
          color: #f0f0f0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: sans-serif;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          color: #f48fb1;
        }
        .beta {
          font-size: 1rem;
          color: #ec407a;
          margin-left: 0.5rem;
        }
        .form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
          max-width: 400px;
        }
        .file-label,
        .prompt-label {
          width: 100%;
          display: flex;
          flex-direction: column;
          font-size: 1rem;
        }
        .file-input,
        .prompt-input {
          margin-top: 0.5rem;
          background: #2c2c3c;
          color: #fff;
          border: none;
          padding: 0.5rem;
          border-radius: 8px;
        }
        .prompt-input {
          height: 100px;
          padding: 0.75rem;
          resize: none;
        }
        .generate-button {
          background: #f48fb1;
          color: #1e1e2f;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1rem;
          transition: background 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 200px;
        }
        .generate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .generate-button:hover:not(:disabled) {
          background: #ec407a;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border-left-color: #1e1e2f;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .limit-msg {
          font-size: 0.9rem;
          color: #ec407a;
        }
        .limit-msg a {
          color: #f48fb1;
          text-decoration: underline;
        }
        .result {
          margin-top: 2rem;
          text-align: center;
        }
        .result img {
          max-width: 100%;
          border-radius: 8px;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
