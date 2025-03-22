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
      <div className="backdrop-blur"></div>
      <div className="content">
        <h1>Ferramentas</h1>
        
        <div className="tools-nav">
          {tools.map((tool, index) => (
            <Link 
              key={tool.name} 
              href={tool.link}
              className={`nav-item ${tool.disabled ? "disabled" : ""}`}
              style={{ 
                backgroundColor: `${tool.color}DD`,
                animationDelay: `${index * 0.1}s` 
              }}
            >
              <div className="icon">{tool.icon}</div>
              <span className="nav-text">{tool.name}</span>
            </Link>
          ))}
        </div>
        
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
                <Link href={tool.link} className="card-link" style={{
                  background: `linear-gradient(135deg, ${tool.color}, ${tool.color}DD)`,
                  boxShadow: `0 10px 15px -3px ${tool.color}40`
                }}>
                  Acessar
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .container {
          position: relative;
          padding: 2rem 1.5rem;
          background: radial-gradient(circle at top right, #fff1f7, #fdf4f9);
          min-height: 100vh;
          font-family: 'Poppins', sans-serif;
          overflow: hidden;
        }
        
        .backdrop-blur {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23e62e69' fill-opacity='0.05'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          z-index: 0;
        }
        
        .content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 2rem;
          color: #e62e69;
          font-size: 2.5rem;
          font-weight: 700;
          position: relative;
          display: inline-block;
          left: 50%;
          transform: translateX(-50%);
        }
        
        h1::after {
          content: "";
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: linear-gradient(to right, #e62e69, transparent);
          border-radius: 2px;
        }
        
        .tools-nav {
          display: flex;
          overflow-x: auto;
          gap: 1rem;
          padding: 0.5rem;
          margin-bottom: 2.5rem;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          position: relative;
        }
        
        .tools-nav::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 40px;
          background: linear-gradient(to right, transparent, #fdf4f9);
          z-index: 2;
          pointer-events: none;
        }
        
        .tools-nav::-webkit-scrollbar {
          display: none;
        }
        
        .nav-item {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          border-radius: 16px;
          color: white;
          text-decoration: none;
          min-width: 100px;
          text-align: center;
          scroll-snap-align: start;
          transition: all 0.3s ease;
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
          transform: translateY(20px);
          backdrop-filter: blur(5px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
        }
        
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .nav-item:hover, .nav-item:active {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
        }
        
        .nav-item.disabled {
          opacity: 0.6;
          pointer-events: none;
        }
        
        .icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }
        
        .nav-text {
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          letter-spacing: 0.5px;
        }
        
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          animation-delay: 0.3s;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 2rem;
          color: #333;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-left: 5px solid #e62e69;
          position: relative;
          z-index: 1;
          overflow: hidden;
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
          transform: translateY(20px);
          backdrop-filter: blur(5px);
        }
        
        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.12);
        }
        
        .card:hover .icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }
        
        .card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0));
          z-index: -1;
        }
        
        .card.disabled {
          opacity: 0.7;
          pointer-events: none;
          filter: grayscale(0.5);
        }
        
        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          color: white;
          margin-right: 1.2rem;
          font-size: 1.4rem;
          transition: all 0.3s ease;
        }
        
        .card h2 {
          font-size: 1.5rem;
          margin: 0;
          color: #333;
          font-weight: 600;
        }
        
        .description {
          font-size: 1rem;
          margin-bottom: 2rem;
          flex-grow: 1;
          line-height: 1.6;
          color: #555;
        }
        
        .card-link {
          display: inline-block;
          color: white;
          width: 100%;
          padding: 1rem 0;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          text-align: center;
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-size: 0.9rem;
        }
        
        .card-link:hover {
          transform: translateY(-3px);
          filter: brightness(1.05);
        }
        
        .coming-soon {
          display: inline-block;
          background: #f5f5f5;
          width: 100%;
          padding: 1rem 0;
          border-radius: 10px;
          text-align: center;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 1.5rem 1rem;
          }
          
          h1 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
          }
          
          .cards {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .card {
            padding: 1.5rem;
          }
          
          .card h2 {
            font-size: 1.3rem;
          }
          
          .description {
            font-size: 0.95rem;
            margin-bottom: 1.5rem;
          }
          
          .tools-nav {
            padding-bottom: 1rem;
            margin-bottom: 2rem;
            justify-content: space-between;
          }
          
          .nav-item {
            min-width: 90px;
            padding: 0.8rem;
          }
          
          .icon {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </main>
  );
}
