"use client";

export default function PlanosPage() {
  return (
    <div className="container">
      <h1>Planos</h1>
      <div className="plans">
        <div className="plan">
          <h2>Basic</h2>
          <p>R$15,00 - 100 Gerações</p>
          <a 
            className="whatsapp-btn" 
            href="https://wa.me/5511954997799" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Clique aqui para adquirir um plano
          </a>
        </div>
        <div className="plan">
          <h2>Premium</h2>
          <p>R$20,00 - 250 Gerações</p>
          <a 
            className="whatsapp-btn" 
            href="https://wa.me/5511954997799" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Clique aqui para adquirir um plano
          </a>
        </div>
        <div className="plan">
          <h2>Enterprise</h2>
          <p>R$30,00 - 500 Gerações</p>
          <a 
            className="whatsapp-btn" 
            href="https://wa.me/5511954997799" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Clique aqui para adquirir um plano
          </a>
        </div>
      </div>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

        .container {
          padding: 2rem;
          text-align: center;
          font-family: 'Roboto', sans-serif;
          background-color: #fdf4f9;
          min-height: 100vh;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          color: #343a40;
        }
        .plans {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .plan {
          background: #ffffff;
          border: 2px solid #e62e69;
          border-radius: 12px;
          padding: 2rem;
          width: 250px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .plan:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
        .plan h2 {
          margin-bottom: 1rem;
          font-size: 1.75rem;
          color: #e62e69;
        }
        .plan p {
          font-size: 1.1rem;
          color: #343a40;
        }
        .whatsapp-btn {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #25d366;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        .whatsapp-btn:hover {
          background-color: #128c7e;
        }
      `}</style>
    </div>
  );
}
