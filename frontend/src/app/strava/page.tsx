// src/app/strava/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// Componente de carregamento para o Suspense
function Loading() {
  return (
    <div className="loading-container">
      <div className="loading">Carregando...</div>
      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
        }
        .loading {
          padding: 2rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

// Componente principal que usa useSearchParams
function StravaContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      if (session || isDemo) {
        // Redirecionar para a nova página strava-for
        // Mantém o modo demo apenas se explicitamente solicitado como true
        router.push(`/strava-for${isDemo ? '?demo=true' : '?demo=false'}`);
      } else {
        // Redirecionar para a página de autenticação
        router.push('/auth');
      }
    }
  }, [session, status, router, isDemo]);

  // Mostrar um indicador de carregamento enquanto redireciona
  return (
    <div className="loading-container">
      <div className="loading">Redirecionando...</div>
      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
        }
        .loading {
          padding: 2rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

// Componente principal da página envolvido em Suspense
export default function StravaPage() {
  return (
    <Suspense fallback={<Loading />}>
      <StravaContent />
    </Suspense>
  );
}
