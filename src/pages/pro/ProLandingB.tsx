import { BadgePercent, CircleX, MapPin, Megaphone, QrCode, Sparkles } from 'lucide-react';
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
import { FREE_MONTHS } from '@/lib/plans';

// Chiffres issus de l'étude de marché (MARCHE-Plats-du-Jour.md)
const painPoints = [
  "Votre ardoise n'est vue que par ceux qui passent devant votre porte",
  "Vous n'avez pas le temps de publier chaque jour sur les réseaux sociaux",
  'Les plateformes de livraison prennent 15 à 25 % de commission sur vos ventes',
  'Les actifs du quartier ne savent pas ce que vous servez aujourd’hui',
];

const differences = [
  {
    icon: Megaphone,
    title: 'Une communication massive',
    text: 'Vos plats du jour relayés sur les réseaux sociaux, avec des publications ciblées par quartier',
    tags: ['Instagram', 'Facebook', 'LinkedIn'],
  },
  {
    icon: MapPin,
    title: 'Une visibilité locale',
    text: 'Vous apparaissez auprès des clients qui travaillent à quelques minutes à pied de chez vous',
  },
  {
    icon: QrCode,
    title: 'Un QR code pour vos habitués',
    text: 'Affichez-le en salle ou en vitrine : vos habitués retrouvent votre plat du jour chaque midi sur leur téléphone',
  },
  {
    icon: BadgePercent,
    title: 'Zéro commission',
    text: 'Un abonnement simple, sans pourcentage prélevé sur ce que vous vendez',
  },
];

/** Version B de la landing pro : problèmes des restaurateurs et arguments différenciants. */
export default function ProLandingB({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Espace pro" />

      <main className={landingMain}>
        {/* Hero */}
        <section className={`bg-accent-soft px-5 pb-8 pt-8 lg:py-16 ${landingSection}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
            Restaurants, traiteurs, boulangeries
          </p>
          <h1 className="mt-2 text-[26px] font-bold leading-tight text-foreground lg:max-w-3xl lg:text-[40px]">
            Votre plat du jour mérite mieux qu'une <span className="text-accent-strong">ardoise sur le trottoir</span>
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground lg:max-w-2xl lg:text-lg">
            Plats du Jour le fait connaître à tout le quartier, chaque midi, sur l'app et sur les réseaux
            sociaux
          </p>

          {!loggedIn && (
            <div className="mt-6 lg:max-w-sm">
              <MainCta loggedIn={false} />
              <LoginHint />
            </div>
          )}
        </section>

        {/* Problèmes */}
        <section className={`px-5 py-8 lg:py-14 ${landingSection}`}>
          <h2 className="text-xl font-bold text-foreground lg:text-3xl">Vous vous reconnaissez ?</h2>
          <ul className="mt-4 space-y-3 lg:mt-8 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-5 lg:space-y-0">
            {painPoints.map((pain) => (
              <li key={pain} className="flex gap-3 text-[14px] leading-snug text-foreground">
                <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-accent-strong" aria-hidden="true" />
                {pain}
              </li>
            ))}
          </ul>
        </section>

        {/* Un vrai besoin */}
        <section
          className={`border-t border-border bg-muted px-5 py-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-14 ${landingSection}`}
        >
          <div>
            <h2 className="text-xl font-bold text-foreground lg:text-3xl">On répond à un vrai besoin</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground lg:text-base">
              À Marseille, près de <span className="font-semibold text-foreground">450 000 actifs et étudiants</span>{' '}
              cherchent chaque midi où déjeuner. Plats du Jour leur montre les plats du jour de leur quartier
              en un coup d'œil : le vôtre en fait partie
            </p>
          </div>
          <div className="mt-6 lg:mt-0 lg:scale-125">
            <ListPreview />
          </div>
        </section>

        {/* La différence */}
        <section className={`border-t border-border px-5 py-8 lg:py-14 ${landingSection}`}>
          <h2 className="text-xl font-bold text-foreground lg:text-3xl">Nous, on fait la différence</h2>
          <ul className="mt-5 space-y-4 lg:mt-8 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
            {differences.map(({ icon: Icon, title, text, tags }) => (
              <li key={title} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[15px] font-semibold text-foreground">{title}</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{text}</p>
                {tags && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-strong">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Accroche */}
        <section className={`bg-foreground px-5 py-8 text-center lg:py-14 ${landingSection}`}>
          <Sparkles className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-2 text-2xl font-bold leading-tight text-card">Ça va changer la donne</p>
          <p className="mt-2 text-sm text-card/80">
            {FREE_MONTHS} mois offerts pour le vérifier par vous-même
          </p>
        </section>

        <section className={`px-5 py-6 lg:py-10 ${landingSection}`}>
          <ReassuranceRow />
        </section>

        {/* Formules */}
        <section className={`border-t border-border bg-muted px-5 py-8 lg:py-14 ${landingSection}`}>
          <h2 className="text-xl font-bold text-foreground lg:text-3xl">Nos formules</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {FREE_MONTHS} mois offerts sur toutes les formules. Vous choisirez la vôtre à l'inscription,
            et pourrez en changer à tout moment
          </p>
          <div className="mt-4">
            <PlanCards columns />
          </div>
        </section>

        <GettingStartedTeaser />
        <FaqPreviewSection />
        <FinalCta loggedIn={loggedIn} title="Prêt à changer la donne ?" />
      </main>
    </div>
  );
}
