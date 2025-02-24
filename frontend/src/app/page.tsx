// src/app/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <div className="container">
      <header className="header">
        <div className="header-top">
          <div className="logo-container">
            {/* Certifique-se de ter a logo em /public/logo.svg ou ajuste o caminho */}
            <img src="/gallery/logo.png" alt="Unia Logo" className="logo" />
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
      </header>

      <main>
        <section className="intro-frame">
          <h2>
            Unhas de Pinterest, em minutos{" "}
            <span role="img" aria-label="nail">
              💅
            </span>
          </h2>
          <p className="tagline">
            Obtenha designs de unhas deslumbrantes com nosso gerador de arte de
            unhas com IA. Descreva sua ideia, escolha seus estilos e receba designs
            únicos.
          </p>
          <Link href="/auth">
            <button className="cta-button">Crie sua unha com AI</button>
          </Link>
        </section>

        <section className="gallery-frame">
          <h2>Galeria</h2>
          <div className="images">
            {Array.from({ length: 8 }).map((_, index) => (
              <img
                key={index}
                src={`/gallery/img (${index + 1}).png`}
                alt={`Design ${index + 1}`}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="footer-frame">
        <p>&copy; {new Date().getFullYear()} Unia. Todos os direitos reservados.</p>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

        .container {
          background-color: #fdf3f9;
          color: #333;
          min-height: 100vh;
          font-family: 'Roboto', sans-serif;
          padding: 2rem;
        }

        /* Header */
        .header {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
        .logo {
          max-width: 100px;
          height: auto;
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

        /* Main Content */
        main {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .intro-frame,
        .gallery-frame {
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .intro-frame h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #e62e69;
          text-align: center;
        }
        .tagline {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          text-align: center;
          color: #666;
        }
        .cta-button {
          background: #e62e69;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.2rem;
          cursor: pointer;
          color: #fff;
          display: block;
          margin: 0 auto;
          transition: background 0.3s;
        }
        .cta-button:hover {
          background: #d0225e;
        }
        .gallery-frame h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #e62e69;
          text-align: center;
        }
        .images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
        }
        .images img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        /* Footer */
        .footer-frame {
          text-align: center;
          padding: 1rem;
          color: #777;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}
