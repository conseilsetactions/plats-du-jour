import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, CalendarDays, Eye } from 'lucide-react';
import Header from '@/components/Header';
import PlanCards from '@/components/pro/PlanCards';
import {
  FaqPreviewSection,
  FinalCta,
  GettingStartedTeaser,
  ListPreview,
  LoginHint,
  MainCta,
  ReassuranceRow,
} from '@/components/pro/landingParts';
import { landingMain, landingSection } from '@/components/layout';
import { getVariant, trackAb } from '@/lib/abtest';
import { FREE_MONTHS } from '@/lib/plans';
import { proStore, useProDb } from '@/lib/proStore';
import ProLandingB from '@/pages/pro/ProLandingB';

const steps = [
  {
    icon: BadgeCheck,
    title: 'Créez votre compte',
    text: 'Avec votre portable et le SIRET de votre établissement, vérifié automatiquement',
  },
  {
    icon: CalendarDays,
    title: 'Publiez votre semaine',
    text: 'Votre plat du jour ou votre menu, du lundi au vendredi, en une seule fois',
  },
  {
    icon: Eye,
    title: 'Les clients vous trouvent',
    text: 'De 11h à 14h, vos plats apparaissent aux clients de votre quartier',
  },
];

/**
 * Landing pro (« Publier mon menu ») en A/B test : chaque visiteur voit la version A
 * (présentation) ou B (problèmes et arguments). Les vues sont mesurées pour /admin.
 */
export default function ProLanding() {
  // Une inscription inachevée n'est pas considérée comme connectée
  const loggedIn = proStore.hasActiveSpace(useProDb());
  const [variant] = useState(getVariant);
  const viewTracked = useRef(false);

  // Une vue par visite, uniquement pour les prospects (pas pour les pros déjà inscrits).
  // La référence évite le double comptage du mode développement de React.
  useEffect(() => {
    if (loggedIn || viewTracked.current) return;
    viewTracked.current = true;
    trackAb('view', variant);
  }, []);

  return variant === 'b' ? <ProLandingB loggedIn={loggedIn} /> : <LandingA loggedIn={loggedIn} />;
}

/** Version A : présentation du service. */
function LandingA({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Espace pro" />

      <main className={landingMain}>
        {/* Hero (ordinateur : texte à gauche, aperçu à droite) */}
        <section
          className={`bg-accent-soft px-5 pb-8 pt-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-16 ${landingSection}`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
              Restaurants, traiteurs, boulangeries
            </p>
            <h1 className="mt-2 text-[26px] font-bold leading-tight text-foreground lg:text-[40px]">
              Faites connaître votre <span className="text-accent-strong">plat du jour</span> aux clients
              du quartier
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground lg:text-lg">
              Chaque midi, les clients autour de vous voient ce que vous servez. Vous publiez votre semaine
              en quelques minutes
            </p>

            {/* Connecté : pas de bouton en haut (accès à l'espace via le bloc final et le menu) */}
            {!loggedIn && (
              <div className="mt-6 lg:max-w-sm">
                <MainCta loggedIn={false} />
                <LoginHint />
              </div>
            )}
          </div>

          <div className="mt-8 lg:mt-0 lg:scale-125">
            <ListPreview />
          </div>
        </section>

        <section className={`px-5 py-6 lg:py-10 ${landingSection}`}>
          <ReassuranceRow />
        </section>

        {/* Comment ça marche */}
        <section className={`border-t border-border px-5 py-8 lg:py-14 ${landingSection}`}>
          <h2 className="text-xl font-bold text-foreground lg:text-center lg:text-3xl">Comment ça marche</h2>
          <ol className="mt-5 space-y-5 lg:mt-10 lg:grid lg:grid-cols-3 lg:gap-10 lg:space-y-0">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-4 lg:flex-col lg:items-center lg:text-center">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground lg:h-14 lg:w-14">
                  <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-foreground text-[10px] font-bold text-card">
                    {i + 1}
                  </span>
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-foreground lg:text-base">{title}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground lg:text-sm">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Formules */}
        <section className={`border-t border-border bg-muted px-5 py-8 lg:py-14 ${landingSection}`}>
          <h2 className="text-xl font-bold text-foreground lg:text-center lg:text-3xl">Nos formules</h2>
          <p className="mt-1 text-[13px] text-muted-foreground lg:text-center lg:text-sm">
            {FREE_MONTHS} mois offerts sur toutes les formules. Vous choisirez la vôtre à l'inscription,
            et pourrez en changer à tout moment
          </p>
          <div className="mt-4 lg:mt-8">
            <PlanCards columns />
          </div>
        </section>

        <GettingStartedTeaser />
        <FaqPreviewSection />
        <FinalCta loggedIn={loggedIn} title="Prêt à faire connaître votre plat du jour ?" />
      </main>
    </div>
  );
}
