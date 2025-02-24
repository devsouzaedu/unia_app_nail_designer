// src/app/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="container">
      <header>
        <div className="header-top">
          <h1>
            Unia <span className="subtitle">(beta - desenvolvido por José e Mariana Souza)</span>
          </h1>
          <button className="hamburger" onClick={toggleMenu}>
            ☰
          </button>
        </div>
        {menuOpen && (
          <nav className="menu">
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
        )}
        <div className="intro">
          <h2>
            Unhas de Pinterest, em minutos <span role="img" aria-label="nail">💅</span>
          </h2>
          <p className="tagline">
            Obtenha designs de unhas deslumbrantes com nosso gerador de arte de unhas com IA. 
            Descreva sua ideia, escolha seus estilos e receba designs únicos.
          </p>
          <Link href="/auth">
            <button className="cta-button">Crie sua unha com AI</button>
          </Link>
        </div>
      </header>

      <section className="gallery">
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

      <footer>
        <p>&copy; {new Date().getFullYear()} Unia. Todos os direitos reservados.</p>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        .container {
          background-color: #fff;
          color: #333;
          min-height: 100vh;
          font-family: 'Roboto', sans-serif;
          padding: 2rem;
        }
        header {
          padding: 2rem 0;
          text-align: center;
          position: relative;
          border-bottom: 1px solid #eee;
          margin-bottom: 2rem;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        h1 {
          font-size: 2.5rem;
          margin: 0;
          color: #e62e69;
        }
        .subtitle {
          display: block;
          font-size: 1rem;
          color: #999;
          margin-top: 0.5rem;
        }
        .hamburger {
          background: transparent;
          border: none;
          font-size: 2rem;
          color: #333;
          cursor: pointer;
        }
        .menu {
          position: absolute;
          top: 100%;
          right: 2rem;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 1rem;
          z-index: 10;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .menu ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .menu li {
          margin-bottom: 0.75rem;
        }
        .menu li:last-child {
          margin-bottom: 0;
        }
        .menu a {
          color: #e62e69;
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
        }
        .intro {
          margin-top: 2rem;
          padding: 0 1rem;
        }
        .intro h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #e62e69;
        }
        .tagline {
          font-size: 1.2rem;
          margin-bottom: 2rem;
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
          transition: background 0.3s;
        }
        .cta-button:hover {
          background: #d0225e;
        }
        .gallery {
          padding: 2rem 0;
          text-align: center;
        }
        .gallery h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #e62e69;
        }
        .images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
          padding: 0 1rem;
        }
        .images img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        footer {
          text-align: center;
          padding: 1rem 0;
          color: #777;
          border-top: 1px solid #eee;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}
