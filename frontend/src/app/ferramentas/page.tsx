"use client";

import Link from "next/link";
import { FaPaintBrush, FaSearch, FaStopwatch, FaCalculator, FaCalendarAlt } from "react-icons/fa";

const tools = [
  {
    name: "Crie unhas com IA",
    description: "Crie e edite unhas com IA generativa.",
    link: "/lab",
    disabled: false,
    icon: <FaPaintBrush />,
    color: "#e62e69",
  },
  {
    name: "Detectar e Aprender",
    description: "Detecta a unha e gera um tutorial.",
    link: "/detect-and-teach",
    disabled: false,
    icon: <FaSearch />,
    color: "#9c27b0",
  },
  {
    name: "Cronometro de Serviço",
    description: "Acompanhe seu progresso e compartilhe seus designs.",
    link: "/strava?demo=false",
    disabled: false,
    icon: <FaStopwatch />,
    color: "#2196f3",
  },
  {
    name: "Organização financeira",
    description: "Calcule seus ganhos e gerencie agendamentos.",
    link: "/calculator?demo=false",
    disabled: false,
    icon: <FaCalculator />,
    color: "#4caf50",
  },
  {
    name: "Calendário de Agendamentos",
    description: "Organize seus agendamentos de manicure com visualização diária, semanal e mensal.",
    link: "/calendario",
    disabled: false,
    icon: <FaCalendarAlt />,
    color: "#ff9800",
  },
];

export default function FerramentasPage() {
  return (
    <div className="page-container">
      <div className="content">
        <h1>Ferramentas</h1>
        
        <div className="cards">
          {tools.map((tool, index) => (
            <div 
              key={tool.name} 
              className={`card ${tool.disabled ? "disabled" : ""}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                borderColor: tool.color 
              }}
            >
              <div className="card-header">
                <div className="icon-wrapper" style={{ 
                  backgroundColor: tool.color,
                  boxShadow: `0 10px 15px -3px ${tool.color}40`
                }}>
                  {tool.icon}
                </div>
                <h2>{tool.name}</h2>
              </div>
              <p className="description">{tool.description}</p>
              {tool.disabled ? (
                <span className="coming-soon">Em breve</span>
              ) : (
                <Link 
                  href={tool.link} 
                  className="card-link"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color}, ${tool.color}DD)`,
                    padding: '0.75rem 1.5rem',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    display: 'block',
                    width: 'auto',
                    textAlign: 'center',
                    margin: '1rem auto',
                    transition: 'all 0.3s ease',
                    letterSpacing: '1px',
                    border: '2px solid transparent',
                    textDecoration: 'none',
                    boxShadow: `0 4px 6px -1px ${tool.color}40`,
                    minWidth: '120px',
                    maxWidth: '200px'
                  }}
                >
                  Acessar
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .page-container {
          padding: 2rem 1.5rem;
          background: radial-gradient(circle at top right, #fff1f7, #fdf4f9);
          min-height: 100vh;
          font-family: 'Poppins', sans-serif;
          position: relative;
        }
        
        .content {
          position: relative;
          z-index: 1;
        }
        
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 2rem;
          font-size: 2.5rem;
          font-weight: 600;
        }
        
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          padding: 1rem;
        }
        
        .card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 2px solid transparent;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: fadeIn 0.5s ease forwards;
          opacity: 0;
          display: flex;
          flex-direction: column;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .card.disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }
        
        h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
          font-weight: 600;
        }
        
        .description {
          color: #666;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }
        
        .card-link:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          border-color: white;
        }
        
        .coming-soon {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: #f0f0f0;
          color: #999;
          border-radius: 8px;
          font-size: 0.9rem;
          text-align: center;
          margin: 0 auto;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .cards {
            grid-template-columns: 1fr;
          }
          
          .card {
            padding: 1.5rem;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .card-link {
            width: 100% !important;
            max-width: none !important;
            padding: 0.75rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}