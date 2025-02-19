import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
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
        <button className="generate-button">Gerar unha editada</button>
      </div>
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
        .generate-button:hover {
          background: #ec407a;
        }
      `}</style>
    </div>
  );
}
