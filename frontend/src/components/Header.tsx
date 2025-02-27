// frontend/components/Header.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">
          <h1>Meu App</h1>
        </div>
        <button className="hamburger" onClick={toggleMenu}>
          <span className="hamburger-icon">{menuOpen ? "✖" : "☰"}</span>
        </button>
        <div className="user-info">
          {session ? (
            <>
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Foto de perfil"
                  className="profile-image"
                />
              )}
              <p className="user-name">Olá, {session.user?.name}</p>
            </>
          ) : (
            <p className="user-name">Olá, visitante</p>
          )}
        </div>
      </div>
      <nav className={`menu ${menuOpen ? "open" : ""}`}>
        <ul>
          <li>
            <Link href="/auth">Login</Link>
          </li>
          <li>
            <Link href="/lab">Gerar unha IA</Link>
          </li>
          <li>
            <Link href="/detectar">Detectar unha</Link>
          </li>
          <li>
            <Link href="/recibo">Recibo Nail Designer</Link>
          </li>
          <li>
            <Link href="/planos">Planos</Link>
          </li>
          <li>
            <Link href="/contato">Contato</Link>
          </li>
        </ul>
      </nav>

      <style jsx>{`
        .header {
          background-color: #f8f9fa;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 1rem 2rem;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        .logo h1 {
          font-size: 1.5rem;
          color: #343a40;
          margin: 0;
        }
        .hamburger {
          background: transparent;
          border: none;
          font-size: 2rem;
          color: #343a40;
          cursor: pointer;
        }
        .user-info {
          display: flex;
          align-items: center;
        }
        .profile-image {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 0.5rem;
        }
        .user-name {
          font-size: 1rem;
          color: #343a40;
          margin: 0;
        }
        .menu {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.4s ease, opacity 0.4s ease;
        }
        .menu.open {
          max-height: 300px;
          opacity: 1;
          margin-top: 1rem;
        }
        .menu ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .menu li {
          margin-bottom: 1rem;
        }
        .menu li a {
          color: #e62e69;
          text-decoration: none;
          font-weight: 500;
          font-size: 1.1rem;
        }
      `}</style>
    </header>
  );
}
