"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container">
      <header>
        <h1>
          Unhas de Pinterest, em minutos <span role="img" aria-label="nail">💅</span>
        </h1>
        <p className="tagline">
          Obtenha designs de unhas deslumbrantes em minutos com nosso gerador de arte de unhas com IA.
          Descreva sua ideia, escolha seus estilos e receba designs únicos.
        </p>
        <Link href="/lab">
          <button className="cta-button">Crie sua unha com AI</button>
        </Link>
      </header>
      <section className="gallery">
        <h2>Galeria</h2>
        <div className="images">
          {Array.from({ length: 8 }).map((_, index) => (
            <img key={index} src={`/gallery/img${index + 1}.jpg`} alt={`Design ${index + 1}`} />
          ))}
        </div>
      </section>
      <style jsx>{`
        .container {
          padding: 2rem;
          text-align: center;
          font-family: sans-serif;
          background: #fff;
          color: #333;
        }
        header {
          margin-bottom: 2rem;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .tagline {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        .cta-button {
          background: #f48fb1;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.2rem;
          cursor: pointer;
          color: #fff;
          transition: background 0.3s;
        }
        .cta-button:hover {
          background: #ec407a;
        }
        .gallery {
          margin-top: 3rem;
        }
        .images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        .images img {
          width: 100%;
          height: auto;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
