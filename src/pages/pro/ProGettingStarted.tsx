import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { CalendarCheck, CircleX, Gift, Handshake, Megaphone, Settings2, Sprout, UtensilsCrossed } from 'lucide-react';
import Header from '@/components/Header';
import { MainCta } from '@/components/pro/landingParts';
import { FREE_MONTHS } from '@/lib/plans';
import { proStore, useProDb } from '@/lib/proStore';
import { pageMain } from '@/components/layout';

const steps = [
  {
    icon: UtensilsCrossed,
    title: 'Vous publiez, chaque jour',
    text: 'Votre plat du jour ou votre menu, du lundi au vendredi. Quelques minutes pour toute la semaine',
  },
  {
    icon: CalendarCheck,
    title: 'Vous prenez le pli',
    text: 'Publier devient un réflexe, comme écrire votre ardoise le matin',
  },
  {
    icon: Settings2,
    title: 'On ajuste ensemble',
    text: 'Vos retours nous servent à améliorer la plateforme pour qu’elle colle à votre quotidien',
  },
  {
    icon: Megaphone,
    title: 'On lance la communication',
    text: 'Vos plats deviennent le contenu de nos publications ciblées par quartier sur les réseaux sociaux',
  },
];

const promises = [
  { icon: Gift, label: `${FREE_MONTHS} mois gratuits` },
  { icon: Handshake, label: 'Sans engagement' },
  { icon: CircleX, label: 'Annulable à tout moment' },
];

/**
 * « Bien démarrer » : pourquoi il faut d'abord publier avant que la communication démarre.
 * Affichée juste après l'inscription, puis accessible depuis le menu et les landings.
 */
export default function ProGettingStarted() {
  const loggedIn = proStore.hasActiveSpace(useProDb());

  // Vue une fois : elle ne s'affichera plus automatiquement à la connexion
  useEffect(() => {
    if (proStore.shouldShowGettingStarted()) proStore.markGettingStartedSeen();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Espace pro" />

      <main className={pageMain}>
        {/* Hero */}
        <section className="bg-accent-soft px-5 pb-8 pt-8">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-strong">
            <Sprout className="h-4 w-4" />
            Bien démarrer
          </p>
          <h1 className="mt-2 text-[26px] font-bold leading-tight text-foreground">
            Tout commence par <span className="text-accent-strong">vos publications</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Il faut bien commencer quelque part : pour que les clients viennent, la plateforme doit d'abord
            être remplie. Ce sont vos plats du jour qui l'alimentent
          </p>
        </section>

        {/* Étapes */}
        <section className="px-5 py-8">
          <h2 className="text-xl font-bold text-foreground">Comment on construit ensemble</h2>
          <ol className="relative mt-5 space-y-5 border-l-2 border-accent-soft pl-6">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative">
                <span className="absolute -left-[41px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle">Étape {i + 1}</span>
                <span className="block text-[15px] font-semibold text-foreground">{title}</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{text}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Effort / récompense */}
        <section className="bg-foreground px-5 py-8 text-center">
          <p className="text-2xl font-bold leading-tight text-card">
            Un effort aujourd'hui,
            <br />
            <span className="text-accent">une récompense demain</span>
          </p>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-card/80">
            Les premières semaines, vous publiez sans voir tout de suite la différence. C'est normal : chaque
            plat publié prépare la suite. Il faut jouer le jeu
          </p>
        </section>

        {/* Pourquoi c'est gratuit */}
        <section className="px-5 py-8">
          <h2 className="text-xl font-bold text-foreground">C'est pour ça que c'est gratuit {FREE_MONTHS} mois</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Le temps de prendre vos habitudes, de remplir la plateforme et de lancer la communication, sans
            rien payer. Vous jugez ensuite sur pièce
          </p>
          <ul className="mt-5 grid grid-cols-3 gap-2">
            {promises.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-1.5 text-center text-xs font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </section>

        {/* Action */}
        <section className="bg-accent px-5 py-8 text-center">
          <h2 className="text-xl font-bold text-accent-foreground">
            {loggedIn ? 'À vous de jouer !' : 'Prêt à jouer le jeu ?'}
          </h2>
          <div className="mt-5">
            {loggedIn ? (
              <Link
                to="/pro/espace"
                className="flex w-full items-center justify-center rounded-lg bg-card px-4 py-3 text-[15px] font-semibold text-accent-strong no-underline hover:bg-accent-soft"
              >
                Publier mes premiers plats
              </Link>
            ) : (
              <MainCta loggedIn={false} inverted />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
