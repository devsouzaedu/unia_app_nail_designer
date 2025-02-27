// src/app/page.tsx
"use client";

import Link from "next/link";
import Header from "../components/Header";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="container">
      <Header />
      <main>
        <section className="intro">
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
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Unia. Todos os direitos reservados.</p>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

        .container {
          background-color: #fdf4f9;
          color: #333;
          min-height: 100vh;
          font-family: 'Roboto', sans-serif;
          padding: 2rem;
        }

        main {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .intro {
          text-align: center;
          padding: 2rem 0;
        }
        .intro h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
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
          text-align: center;
          padding: 2rem 0;
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
        }
        .images img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .footer {
          text-align: center;
          padding: 1rem 0;
          color: #777;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}
