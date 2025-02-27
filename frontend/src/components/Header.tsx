// frontend/components/Header.tsx
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#f8f9fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", color: "#343a40" }}>Meu App</h1>
      <div style={{ display: "flex", alignItems: "center" }}>
        {session ? (
          <>
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="Foto de perfil"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  marginRight: "0.5rem",
                  objectFit: "cover",
                }}
              />
            )}
            <p style={{ margin: 0, fontSize: "1rem", color: "#343a40" }}>
              Olá, {session.user?.name}
            </p>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: "1rem", color: "#343a40" }}>
            Olá, visitante
          </p>
        )}
      </div>
    </header>
  );
}
