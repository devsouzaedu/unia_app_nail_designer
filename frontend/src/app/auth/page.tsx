"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  if (session) {
    return (
      <div className="container">
        <h1>Autenticação</h1>
        <p>Bem-vindo, {session.user?.name}</p>
        <button onClick={() => signOut()}>Sair</button>
        <Link href="/lab">
          <p className="continue">Acessar o Lab</p>
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Autenticação</h1>
      <p>Faça login com o Google para acessar o Lab.</p>
      <button onClick={() => signIn("google")}>Entrar com Google</button>
      <Link href="/lab">
        <p className="continue">Ou continue para o Lab (modo demo)</p>
      </Link>
    </div>
  );
}
