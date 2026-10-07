import { Link } from '@tanstack/react-router';
import { Camera, Copy, Eye, Heart, Megaphone, RotateCcw, TrendingUp, UtensilsCrossed } from 'lucide-react';
import Header from '@/components/Header';
import { proStore, useProDb } from '@/lib/proStore';
import { pageMain } from '@/components/layout';

const reasons = [
  {
    icon: Eye,
    title: 'Vous existez chaque midi',
    text: 'Un jour sans plat publié, c’est un jour où les clients du quartier ne vous voient pas',
  },
  {
    icon: Heart,
    title: 'Vos habitués prennent le réflexe',
    text: 'Ils savent qu’ils trouveront votre plat du jour, tous les midis, au même endroit',
  },
  {
    icon: Megaphone,
    title: 'Vous nourrissez la communication',
    text: 'Nos publications ciblées par quartier sur les réseaux sociaux s’appuient sur vos plats',
  },
  {
    icon: TrendingUp,
    title: 'Les résultats viennent avec le temps',
    text: 'La visibilité se construit semaine après semaine : la régularité fait la différence',
  },
];

const tools = [
  { icon: Copy, text: 'Saisissez toute la semaine en une fois' },
  { icon: RotateCcw, text: 'Reprenez vos plats récents en un clic' },
  { icon: Camera, text: 'Avec Menu + IA, prenez simplement votre ardoise en photo' },
];

/**
 * « Pourquoi continuer » : lien des SMS automatiques de la semaine
 * (félicitations du vendredi, rappel du lundi aux réguliers).
 */
export default function ProKeepGoing() {
  const loggedIn = proStore.hasActiveSpace(useProDb());

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Espace pro" />

      <main className={pageMain}>
        {/* Hero */}
        <section className="bg-accent-soft px-5 pb-8 pt-8">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-strong">
            <TrendingUp className="h-4 w-4" />
            Continuez comme ça
          </p>
          <h1 className="mt-2 text-[26px] font-bold leading-tight text-foreground">
            Votre régularité, c'est <span className="text-accent-strong">votre visibilité</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Chaque plat publié compte. Voici pourquoi il vaut la peine de publier tous les jours
          </p>
        </section>

        {/* Raisons */}
        <section className="px-5 py-8">
          <ul className="space-y-4">
            {reasons.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-foreground">{title}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Accroche */}
        <section className="bg-foreground px-5 py-8 text-center">
          <p className="text-2xl font-bold leading-tight text-card">
            Un jour sans plat,
            <br />
            <span className="text-accent">c'est un jour invisible</span>
          </p>
        </section>

        {/* Outils */}
        <section className="px-5 py-8">
          <h2 className="text-xl font-bold text-foreground">Quelques minutes par semaine suffisent</h2>
          <ul className="mt-4 space-y-3">
            {tools.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[14px] text-foreground">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </section>

        {/* Action */}
        <section className="bg-accent px-5 py-8 text-center">
          <h2 className="text-xl font-bold text-accent-foreground">On compte sur vous !</h2>
          <div className="mt-5">
            <Link
              to={loggedIn ? '/pro/espace' : '/pro/connexion'}
              search={loggedIn ? undefined : { mode: 'login' }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-card px-4 py-3 text-[15px] font-semibold text-accent-strong no-underline hover:bg-accent-soft"
            >
              <UtensilsCrossed className="h-5 w-5" />
              {loggedIn ? 'Publier mes plats de la semaine' : 'Me connecter pour publier'}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
