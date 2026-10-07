import { Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  BadgePercent,
  Clock3,
  Footprints,
  Gift,
  Hourglass,
  Megaphone,
  Smartphone,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import Header from '@/components/Header';
import { pageMain } from '@/components/layout';
import { FREE_MONTHS } from '@/lib/plans';

interface Argument {
  icon: LucideIcon;
  title: string;
  text: string;
}

const forClients: Argument[] = [
  { icon: Footprints, title: 'Près de vous', text: 'Les plats du jour autour de vous, avec le temps de marche' },
  { icon: Hourglass, title: 'Parce que le midi, le temps est compté', text: 'Vous savez où aller avant même de sortir' },
  { icon: Clock3, title: 'En un coup d’œil', text: 'Plat, prix et note Google, de 11h à 14h, sans chercher' },
  { icon: Smartphone, title: 'Gratuit et sans compte', text: 'Pas d’inscription, pas d’application à télécharger' },
];

const forPros: Argument[] = [
  { icon: Megaphone, title: 'Plus de visibilité', text: 'Votre ardoise vue au-delà de votre trottoir, par tout le quartier' },
  { icon: Timer, title: '30 secondes par jour', text: 'Ou toute la semaine en une seule fois' },
  { icon: BadgePercent, title: 'Zéro commission', text: 'Un petit abonnement, rien sur vos ventes' },
  { icon: Gift, title: `${FREE_MONTHS} mois offerts`, text: 'Sans engagement, pour essayer sereinement' },
];

function ArgumentList({ title, items }: { title: string; items: Argument[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-strong">{title}</h3>
      <ul className="mt-3 space-y-3">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">{title}</span>
              <span className="block text-[13px] leading-snug text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function About() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header showProLink />
      <main className={pageMain}>
        <div className="px-4 pt-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent no-underline">
            <ArrowLeft className="h-4 w-4" />
            Accueil
          </Link>
        </div>

        {/* L'histoire */}
        <section className="px-4 pb-6 pt-4 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Qui sommes-nous ?</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-foreground lg:text-3xl">
            Une idée venue d’Estonie, pensée pour la France
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-foreground lg:text-[15px]">
            Plats du Jour, c’est l’histoire de <span className="font-semibold">Christine et Grégor</span>, frère et
            sœur. Christine vit à Marseille, Grégor en Estonie
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground lg:text-[15px]">
            En Estonie, ce service existe déjà : à l’heure du déjeuner, on regarde sur son téléphone les plats du jour
            des restaurants autour de soi, et on choisit où aller. Simple, rapide, entré dans les habitudes
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground lg:text-[15px]">
            En France, il faut encore faire le tour du quartier pour savoir ce qui est servi. Alors nous avons décidé
            de le mettre en place ici, en commençant par Marseille
          </p>
        </section>

        {/* Arguments clés */}
        <section className="border-t border-border px-4 py-6 lg:px-8">
          <h2 className="text-lg font-bold text-foreground">Ce que Plats du Jour change</h2>
          <div className="mt-5 space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
            <ArgumentList title="Pour vous, au déjeuner" items={forClients} />
            <ArgumentList title="Pour les restaurateurs" items={forPros} />
          </div>
        </section>

        {/* Ambition */}
        <section className="border-t border-border bg-muted px-4 py-6 lg:px-8">
          <h2 className="text-lg font-bold text-foreground">Marseille d’abord, la France ensuite</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            Nous commençons par les quartiers de la Joliette et du Vieux-Port, là où beaucoup de monde cherche chaque midi
            où déjeuner. Puis d’autres quartiers et d’autres villes suivront
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/"
              className="rounded-md bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground no-underline hover:bg-accent-strong"
            >
              Voir les plats du jour
            </Link>
            <Link
              to="/pro"
              className="rounded-md border border-accent px-4 py-2.5 text-center text-sm font-semibold text-accent no-underline hover:bg-accent-soft"
            >
              Je suis restaurateur
            </Link>
          </div>
        </section>

        <p className="px-4 py-5 text-center text-xs text-subtle lg:px-8">
          Plats du Jour est édité par C&A Conseils et Actions, à Marseille
        </p>
      </main>
    </div>
  );
}
