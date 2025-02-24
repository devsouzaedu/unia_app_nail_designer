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
    <div className="container">
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
      <style jsx>{`
        .container {
          padding: 2rem;
          text-align: center;
          font-family: sans-serif;
          background: #fff;
          color: #333;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        .auth-button {
          background: #4285f4;
          color: #fff;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 1rem;
        }
        .continue {
          color: #4285f4;
          text-decoration: underline;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
