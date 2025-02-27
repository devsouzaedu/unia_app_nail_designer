// src/app/planos/page.tsx
"use client";

import Link from "next/link";

export default function PlanosPage() {
  const plans = [
    {
      name: "Basic",
      users: 1,
      price: 15,
      description: "Acesso ilimitado para 1 usuário por 1 mês.",
    },
    {
      name: "Studio",
      users: 5,
      price: 45,
      description: "Acesso ilimitado para 5 usuários por 1 mês.",
    },
    {
      name: "Enterprise",
      users: 10,
      price: 100,
      description: "Acesso ilimitado para 10 usuários por 1 mês.",
    },
  ];

  return (
    <div className="planos-container">
      <h1>Planos</h1>
      <div className="planos-cards">
        {plans.map((plan) => (
          <div key={plan.name} className="plan-card">
            <h2>{plan.name}</h2>
            <p>
              <strong>{plan.users} usuário{plan.users > 1 ? "s" : ""}</strong>
            </p>
            <p>R$ {plan.price} / mês</p>
            <p>{plan.description}</p>
            <Link href={`/checkout?plan=${plan.name.toLowerCase()}`}>
              <button className="plan-button">Assinar {plan.name}</button>
            </Link>
          </div>
        ))}
      </div>

      <style jsx>{`
        .planos-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        .planos-cards {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
        }
        .plan-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          width: 300px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        .plan-card:hover {
          transform: scale(1.03);
        }
        .plan-card h2 {
          margin-bottom: 1rem;
          color: #333;
        }
        .plan-button {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 4px;
          background-color: #e62e69;
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .plan-button:hover {
          background-color: #d0225e;
        }
      `}</style>
    </div>
  );
}
