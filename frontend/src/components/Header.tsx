// frontend/components/Header.tsx
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
      {session ? (
        <p>Olá, {session.user?.name}</p>
      ) : (
        <p>Olá, visitante</p>
      )}
    </header>
  );
}
