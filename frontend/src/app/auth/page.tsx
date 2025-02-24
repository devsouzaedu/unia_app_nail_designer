// src/app/auth/page.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Autenticação</h1>
        {session ? (
          <>
            <p>Bem-vindo, {session.user?.name}</p>
            <button className="auth-button" onClick={() => signOut()}>
              Sair
            </button>
            <Link href="/lab">
              <p className="continue">Acessar o Lab</p>
            </Link>
          </>
        ) : (
          <>
            <p>Faça login com o Google para acessar o Lab.</p>
            <button className="auth-button" onClick={() => signIn("google")}>
              Entrar com Google
            </button>
            <Link href="/lab">
              <p className="continue">Ou continue para o Lab (modo demo)</p>
            </Link>
          </>
        )}
      </div>
      <style jsx>{`
        .auth-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #74ebd5 0%, #acb6e5 100%);
          padding: 1rem;
        }
        .auth-card {
          background: #fff;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
          text-align: center;
          max-width: 400px;
          width: 100%;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #333;
        }
        p {
          margin-bottom: 1.5rem;
          color: #555;
        }
        .auth-button {
          background: #4285f4;
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 1rem;
          transition: background 0.3s ease;
        }
        .auth-button:hover {
          background: #357ae8;
        }
        .continue {
          color: #4285f4;
          text-decoration: none;
          font-weight: bold;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        .continue:hover {
          color: #357ae8;
        }
      `}</style>
    </div>
  );
}
