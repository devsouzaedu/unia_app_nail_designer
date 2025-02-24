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
            Unia (beta) <span className="subtitle">(desenvolvido por José E Mariana Souza)</span>
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
            Obtenha designs de unhas deslumbrantes em minutos com nosso gerador de arte de unhas com IA.
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
        .container {
          background-color: #1e1e2f;
          color: #f0f0f0;
          min-height: 100vh;
          font-family: sans-serif;
        }
        header {
          padding: 2rem;
          text-align: center;
          position: relative;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        h1 {
          font-size: 2.5rem;
          margin: 0;
        }
        .subtitle {
          font-size: 1rem;
          color: #ec407a;
        }
        .hamburger {
          background: transparent;
          border: none;
          font-size: 2rem;
          color: #f0f0f0;
          cursor: pointer;
        }
        .menu {
          position: absolute;
          top: 100%;
          right: 2rem;
          background: #2c2c3c;
          border-radius: 8px;
          padding: 1rem;
          z-index: 10;
        }
        .menu ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .menu li {
          margin-bottom: 0.5rem;
        }
        .menu li:last-child {
          margin-bottom: 0;
        }
        .menu a {
          color: #f48fb1;
          text-decoration: none;
          font-size: 1rem;
        }
        .intro {
          margin-top: 2rem;
        }
        h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #f48fb1;
        }
        .tagline {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          color: #f0f0f0;
        }
        .cta-button {
          background: #f48fb1;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.2rem;
          cursor: pointer;
          color: #1e1e2f;
          transition: background 0.3s;
        }
        .cta-button:hover {
          background: #ec407a;
        }
        .gallery {
          padding: 2rem;
          text-align: center;
        }
        .gallery h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #f48fb1;
        }
        .images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          padding: 0 2rem;
        }
        .images img {
          width: 100%;
          height: auto;
          border-radius: 8px;
        }
        footer {
          background: #2c2c3c;
          text-align: center;
          padding: 1rem;
          color: #f0f0f0;
          position: fixed;
          bottom: 0;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
