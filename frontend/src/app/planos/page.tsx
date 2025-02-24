"use client";

export default function PlanosPage() {
  return (
    <div className="container">
      <h1>Planos</h1>
      <div className="plans">
        <div className="plan">
          <h2>Basic</h2>
          <p>R$15,00 - 100 Gerações</p>
        </div>
        <div className="plan">
          <h2>Premium</h2>
          <p>R$20,00 - 250 Gerações</p>
        </div>
        <div className="plan">
          <h2>Enterprise</h2>
          <p>R$30,00 - 500 Gerações</p>
        </div>
      </div>
      <style jsx>{`
        .container {
          padding: 2rem;
          text-align: center;
          font-family: sans-serif;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          color: #333;
        }
        .plans {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .plan {
          background: #f8f8f8;
          border-radius: 8px;
          padding: 1rem;
          width: 200px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .plan h2 {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
