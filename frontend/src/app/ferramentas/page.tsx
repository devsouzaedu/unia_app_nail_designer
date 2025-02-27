"use client";

// frontend/src/app/ferramentas/page.tsx
import Link from "next/link";

const tools = [
  {
    name: "Gen AI Nail Art",
    description: "Crie e edite unhas com IA generativa.",
    link: "/lab",
    disabled: false,
  },
  {
    name: "Detect and Teach",
    description: "Detecta a unha e gera um tutorial.",
    link: "/detect-and-teach",
    disabled: false,
  },
  {
    name: "Strava for Nail Designers",
    description: "Coming Soon",
    link: "/strava",
    disabled: true,
  },
  {
    name: "Calculator for Nail Designers",
    description: "Coming Soon",
    link: "/calculator",
    disabled: true,
  },
];

export default function FerramentasPage() {
  return (
    <main className="container">
      <h1>Ferramentas</h1>
      <div className="cards">
        {tools.map((tool) => (
          <div key={tool.name} className={`card ${tool.disabled ? "disabled" : ""}`}>
            <h2>{tool.name}</h2>
            <p className="description">{tool.description}</p>
            {tool.disabled ? (
              <span className="coming-soon">Coming Soon</span>
            ) : (
              <Link href={tool.link} className="card-link">
                Acessar
              </Link>
            )}
          </div>
        ))}
      </div>
      <style jsx>{`
        .container {
          padding: 2rem;
          background: #fdf4f9; /* Bege suave */
          min-height: 100vh;
          font-family: 'Roboto', sans-serif;
        }
        h1 {
          text-align: center;
          margin-bottom: 2rem;
          color: #e62e69; /* Pink */
          font-size: 2rem;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        .card {
          background: #e62e69; /* Pink */
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          color: #fff;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .card.disabled {
          background: #d0225e; /* Um tom de pink mais escuro para desativados */
          opacity: 0.8;
          pointer-events: none;
        }
        .card h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }
        .description {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }
        .card-link {
          display: inline-block;
          background: #fff;
          color: #e62e69;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          transition: background 0.3s ease, color 0.3s ease;
        }
        .card-link:hover {
          background: #e62e69;
          color: #fff;
          border: 1px solid #fff;
        }
        .coming-soon {
          display: inline-block;
          background: rgba(255, 255, 255, 0.5);
          color: #fff;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: bold;
        }
      `}</style>
    </main>
  );
}
