// src/app/auth/page.tsx
"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="container">
      <div className="auth-frame">
        <h1>Login</h1>
        <p>Digite seu email abaixo para acessar sua conta</p>
        <button className="google-button" onClick={() => signIn("google")}>
          <img src="/google-logo.svg" alt="Logo do Google" />
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
          Não tem uma conta?{" "}
          <Link href="/signup">
            <a>Crie uma agora</a>
          </Link>
        </p>
      </div>
      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f5;
          padding: 1rem;
        }
        .auth-frame {
          background: #fff;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #333;
        }
        p {
          color: #555;
          margin-bottom: 1rem;
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
          margin-bottom: 1rem;
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
          margin: 1rem 0;
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
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
        }
        .login-button {
          width: 100%;
          padding: 0.75rem;
          background: #ff69b4;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s ease;
          margin-bottom: 1rem;
        }
        .login-button:hover {
          background: #ff4da6;
        }
        .signup {
          font-size: 0.9rem;
          color: #555;
        }
        .signup a {
          color: #ff69b4;
          text-decoration: none;
        }
        .signup a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
