import type { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import Header from '@/components/Header';
import { proStore, useProDb } from '@/lib/proStore';
import { pageMain } from '@/components/layout';

type Context = ReturnType<typeof proStore.getContext> & {
  restaurant: NonNullable<ReturnType<typeof proStore.getContext>['restaurant']>;
};

interface ProPageProps {
  title: string;
  /** Page réservée au propriétaire (abonnement, factures, équipe, établissement). */
  ownerOnly?: boolean;
  children: (context: Context) => ReactNode;
}

/** Cadre des pages de l'espace pro (accessibles depuis le menu ☰) avec les contrôles d'accès. */
export default function ProPage({ title, ownerOnly = false, children }: ProPageProps) {
  const db = useProDb();
  const context = proStore.getContext(db);
  const { restaurant, role } = context;

  if (!db.session) return <Navigate to="/pro/connexion" search={{ mode: 'login' }} />;
  // Inscription pas terminée : on reprend là où elle s'est arrêtée
  if (!restaurant) return <Navigate to="/pro/espace" />;
  if (role === 'owner' && !restaurant.billing) return <Navigate to="/pro/abonnement" />;
  if (ownerOnly && role !== 'owner') return <Navigate to="/pro/espace" />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Espace pro" />
      <main className={`${pageMain} pb-10`}>
        <h1 className="px-4 pt-5 text-xl font-bold text-foreground">{title}</h1>
        {children({ ...context, restaurant })}
      </main>
    </div>
  );
}
