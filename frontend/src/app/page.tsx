"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!image || !prompt) {
      alert("Por favor, selecione uma imagem e preencha o prompt.");
      return;
    }
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("prompt", prompt);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.result) {
        setResult(data.result);
      } else {
        alert("Erro: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao gerar a imagem.");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Unia.app - V1.00.0</h1>
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
          disabled={loading}
        >
          {loading ? "Gerando unha, espere..." : "Gerar unha editada"}
        </button>
      </div>
      {result && (
        <div className="result">
          <h2>Resultado:</h2>
          <img src={result} alt="Unha Editada" />
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
        .file-input {
          margin-top: 0.5rem;
          background: #2c2c3c;
          color: #fff;
          border: none;
          padding: 0.5rem;
          border-radius: 8px;
        }
        .prompt-input {
          margin-top: 0.5rem;
          width: 100%;
          height: 100px;
          background: #2c2c3c;
          color: #fff;
          border: none;
          padding: 0.75rem;
          border-radius: 8px;
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
        }
        .generate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .generate-button:hover:not(:disabled) {
          background: #ec407a;
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
