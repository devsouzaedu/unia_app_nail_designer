// src/app/auth/page.tsx
"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [demoCode, setDemoCode] = useState("");
  const [demoError, setDemoError] = useState("");

  // Redireciona automaticamente se o usuário já estiver logado
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/lab");
    }
  }, [status, router]);

  const handleDemoLogin = () => {
    if (demoCode === "2210") {
      // Redireciona para a página de ferramentas em modo demo
      router.push("/ferramentas");
    } else {
      setDemoError("Senha incorreta para o modo demo.");
    }
  };

  // Enquanto a sessão estiver carregando, podemos exibir um carregamento simples
  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  return (
    <div className="container">
      <div className="auth-frame">
        <h1>Login</h1>
        <p className="subtitle">
          Digite seu email abaixo para acessar sua conta ou use o modo demo.
        </p>
        <button
          className="google-button"
          onClick={() => signIn("google", { callbackUrl: "/ferramentas" })}
        >
          <img src="gallery/google-logo.svg" alt="Logo do Google" />
          Continue com o Google
        </button>
        <div className="divider">
          <span>ou continue com email</span>
        </div>
        <input type="email" placeholder="Email" disabled />
        <input type="password" placeholder="Senha" disabled />
        <button className="login-button" disabled>
          Login
        </button>
        <p className="signup">
          Não tem uma conta? <Link href="/signup">Crie uma agora</Link>
        </p>

        {/* Seção de Modo Demo */}
        <div className="demo-section">
          <h2>Modo Demo</h2>
          <p>
            Para testar o app, insira a senha demo de 4 dígitos:
          </p>
          <input
            type="text"
            placeholder="Senha demo"
            value={demoCode}
            onChange={(e) => setDemoCode(e.target.value)}
            maxLength={4}
          />
          <button className="demo-button" onClick={handleDemoLogin}>
            Entrar Modo Demo
          </button>
          {demoError && <p className="error">{demoError}</p>}
        </div>
      </div>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f5;
          padding: 1rem;
          font-family: 'Roboto', sans-serif;
        }
        .auth-frame {
          background: #fff;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #333;
        }
        .subtitle {
          color: #555;
          margin-bottom: 2rem;
        }
        .google-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #fff;
          border: 1px solid #ccc;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          width: 100%;
          transition: background 0.3s ease;
          margin-bottom: 2rem;
        }
        .google-button:hover {
          background: #f7f7f7;
        }
        .google-button img {
          width: 20px;
          height: 20px;
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 2rem 0;
        }
        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid #ccc;
        }
        .divider:not(:empty)::before {
          margin-right: 0.5em;
        }
        .divider:not(:empty)::after {
          margin-left: 0.5em;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1.5rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
        }
        .login-button {
          width: 100%;
          padding: 0.75rem;
          background: #e62e69;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s ease;
          margin-bottom: 2rem;
        }
        .login-button:hover {
          background: #d0225e;
        }
        .signup {
          font-size: 0.9rem;
          color: #555;
        }
        .signup a {
          color: #e62e69;
          text-decoration: none;
        }
        .signup a:hover {
          text-decoration: underline;
        }
        /* Estilos para a seção Demo */
        .demo-section {
          margin-top: 2rem;
          border-top: 1px solid #ccc;
          padding-top: 1rem;
        }
        .demo-section h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        .demo-button {
          width: 100%;
          padding: 0.75rem;
          background: #4caf50;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s ease;
          margin-top: 0.5rem;
        }
        .demo-button:hover {
          background: #43a047;
        }
        .error {
          color: red;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
