"use client";

// frontend/src/app/ferramentas/page.tsx
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
    <main className="container">
      <h1>Ferramentas</h1>
      
      <div className="tools-nav">
        {tools.map((tool) => (
          <Link 
            key={tool.name} 
            href={tool.link}
            className={`nav-item ${tool.disabled ? "disabled" : ""}`}
            style={{ backgroundColor: tool.color }}
          >
            <div className="icon">{tool.icon}</div>
            <span className="nav-text">{tool.name}</span>
          </Link>
        ))}
      </div>
      
      <div className="cards">
        {tools.map((tool) => (
          <div 
            key={tool.name} 
            className={`card ${tool.disabled ? "disabled" : ""}`}
            style={{ borderTopColor: tool.color }}
          >
            <div className="card-header">
              <div className="icon-wrapper" style={{ backgroundColor: tool.color }}>
                {tool.icon}
              </div>
              <h2>{tool.name}</h2>
            </div>
            <p className="description">{tool.description}</p>
            {tool.disabled ? (
              <span className="coming-soon">Em breve</span>
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
          padding: 1.5rem 1rem;
          background: #fdf4f9; /* Bege suave */
          min-height: 100vh;
          font-family: 'Roboto', sans-serif;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #e62e69; /* Pink */
          font-size: 1.8rem;
        }
        
        .tools-nav {
          display: flex;
          overflow-x: auto;
          gap: 0.75rem;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
          scrollbar-width: none; /* Firefox */
        }
        
        .tools-nav::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }
        
        .nav-item {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem;
          border-radius: 12px;
          color: white;
          text-decoration: none;
          min-width: 80px;
          text-align: center;
          scroll-snap-align: start;
          transition: transform 0.2s;
        }
        
        .nav-item:hover, .nav-item:active {
          transform: translateY(-3px);
        }
        
        .nav-item.disabled {
          opacity: 0.6;
          pointer-events: none;
        }
        
        .icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .nav-text {
          font-size: 0.8rem;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        
        .card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          color: #333;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          border-top: 5px solid #e62e69;
        }
        
        .card.disabled {
          opacity: 0.7;
          pointer-events: none;
        }
        
        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          color: white;
          margin-right: 1rem;
          font-size: 1.2rem;
        }
        
        .card h2 {
          font-size: 1.4rem;
          margin: 0;
          color: #333;
        }
        
        .description {
          font-size: 1rem;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }
        
        .card-link {
          display: inline-block;
          background: #e62e69;
          color: white;
          width: 100%;
          padding: 0.75rem 0;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          text-align: center;
          transition: background 0.3s ease, transform 0.2s;
        }
        
        .card-link:hover {
          background: #d41e59;
          transform: translateY(-2px);
        }
        
        .coming-soon {
          display: inline-block;
          background: #f5f5f5;
          width: 100%;
          padding: 0.75rem 0;
          border-radius: 8px;
          text-align: center;
          color: #999;
          font-weight: bold;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 1rem 0.75rem;
          }
          
          h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          
          .cards {
            grid-template-columns: 1fr;
          }
          
          .card {
            padding: 1.25rem;
          }
          
          .card h2 {
            font-size: 1.2rem;
          }
          
          .tools-nav {
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
            justify-content: space-between;
          }
          
          .nav-item {
            min-width: 65px;
            padding: 0.6rem;
          }
          
          .icon {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </main>
  );
}
