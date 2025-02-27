// src/app/components/Header.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className="header">
      <div className="header-top">
        <div className="logo-container">
          <Link href="/">
            <Image
              src="/gallery/logo.png"
              alt="Unia Logo"
              width={120} // ajuste conforme a proporção real da sua logo
              height={60} // ajuste conforme a proporção real da sua logo
              objectFit="contain"
            />
          </Link>
        </div>
        <button className="hamburger" onClick={toggleMenu}>
          <span className={`hamburger-icon ${menuOpen ? "open" : ""}`}>
            ☰
          </span>
        </button>
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
          padding: 1rem 2rem;
          margin-bottom: 2rem;
          position: relative;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo-container {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .hamburger {
          background: transparent;
          border: none;
          font-size: 2rem;
          color: #e62e69;
          cursor: pointer;
          position: absolute;
          top: 1rem;
          right: 2rem;
        }
        /* Menu com animação drop */
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
        .menu li:last-child {
          margin-bottom: 0;
        }
        .menu a {
          color: #e62e69;
          text-decoration: none;
          font-weight: 500;
          font-size: 1.1rem;
        }
      `}</style>
    </header>
  );
}
