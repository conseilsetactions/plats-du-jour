// Éléments communs aux deux versions de la landing pro (A/B test).
import { Link } from '@tanstack/react-router';
import { BadgePercent, ChevronDown, ChevronRight, Clock3, Gift, Handshake, Sprout, Star } from 'lucide-react';
import { trackAb } from '@/lib/abtest';
import { landingSection } from '@/components/layout';
import { FREE_MONTHS } from '@/lib/plans';

export const reassurance = [
  { icon: Gift, label: `${FREE_MONTHS} mois offerts` },
  { icon: BadgePercent, label: 'Sans commission' },
  { icon: Handshake, label: 'Sans engagement' },
];

export const faqPreview = [
  {
    q: 'Prenez-vous une commission ?',
    a: 'Non. Vous payez uniquement votre abonnement, après les 6 mois offerts',
  },
  {
    q: 'Pourquoi mon SIRET ?',
    a: 'Pour vérifier que votre établissement existe et remplir son adresse automatiquement',
  },
  {
    q: 'Quand mes plats sont-ils visibles ?',
    a: 'Du lundi au vendredi de 11h à 14h, uniquement le jour pour lequel vous les avez publiés',
  },
];

const ctaClass =
  'flex w-full flex-col items-center justify-center rounded-lg px-4 py-3 text-center no-underline transition-colors';

/** Bouton principal : inscription (ou accès à l'espace si déjà connecté). Les clics sont mesurés. */
export function MainCta({ loggedIn, inverted = false }: { loggedIn: boolean; inverted?: boolean }) {
  const colors = inverted
    ? 'bg-card text-accent-strong hover:bg-accent-soft'
    : 'bg-accent text-accent-foreground shadow-md hover:bg-accent-strong';
  if (loggedIn) {
    return (
      <Link to="/pro/espace" className={`${ctaClass} ${colors}`}>
        <span className="text-[15px] font-semibold">Accéder à mon espace</span>
      </Link>
    );
  }
  return (
    <Link
      to="/pro/connexion"
      search={{ mode: 'signup' }}
      onClick={() => trackAb('signup_click')}
      className={`${ctaClass} ${colors}`}
    >
      {inverted ? (
        <span className="text-[15px] font-semibold">Créer mon compte gratuit pendant {FREE_MONTHS} mois</span>
      ) : (
        <>
          <span className="text-[15px] font-semibold">Créer mon compte</span>
          <span className="text-xs opacity-90">{FREE_MONTHS} mois gratuits</span>
        </>
      )}
    </Link>
  );
}

/** Lien « Déjà inscrit ? Se connecter » sous le bouton principal. */
export function LoginHint() {
  return (
    <p className="mt-3 text-center text-sm text-muted-foreground">
      Déjà inscrit ?{' '}
      <Link
        to="/pro/connexion"
        search={{ mode: 'login' }}
        className="font-semibold text-accent-strong underline underline-offset-2"
      >
        Se connecter
      </Link>
    </p>
  );
}

/** Aperçu de ce que voit le client dans la liste. */
export function ListPreview() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-[300px] rotate-[-1.5deg] rounded-xl border border-border bg-card p-1 shadow-lg">
      <div className="flex items-center gap-1.5 px-3 pt-2 text-[10px] font-semibold uppercase tracking-wide text-accent-strong">
        <Clock3 className="h-3 w-3" />
        Aujourd'hui, de 11h à 14h
      </div>
      {[
        { name: 'Daube provençale', price: '9,50€', resto: 'Votre restaurant', dist: '220 m', rating: '4,5' },
        { name: 'Pieds paquets', price: '13,50€', resto: 'Le Comptoir', dist: '430 m', rating: '4,6' },
      ].map((row, i) => (
        <div key={row.name} className={`px-3 py-2.5 ${i === 0 ? 'rounded-lg bg-accent-soft' : 'border-t border-border'}`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold text-foreground">{row.name}</span>
            <span className="text-[13px] font-bold text-accent">{row.price}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            {row.resto} · {row.dist} ·
            <Star className="h-2.5 w-2.5 fill-accent text-accent" />
            {row.rating} Google
          </div>
        </div>
      ))}
    </div>
  );
}

/** Encart vers « Bien démarrer » : pourquoi 6 mois gratuits. */
export function GettingStartedTeaser() {
  return (
    <section className={`border-t border-border px-5 pt-8 lg:pt-14 ${landingSection}`}>
      <Link
        to="/pro/bien-demarrer"
        className="flex items-center gap-3 rounded-lg border border-accent/40 bg-accent-soft p-4 no-underline lg:mx-auto lg:max-w-3xl lg:p-5"
      >
        <Sprout className="h-6 w-6 shrink-0 text-accent" />
        <span className="flex-1">
          <span className="block text-[15px] font-semibold text-foreground">Pourquoi {FREE_MONTHS} mois gratuits ?</span>
          <span className="text-[13px] text-muted-foreground">
            Il faut bien commencer quelque part : découvrez comment on construit ensemble
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-accent" />
      </Link>
    </section>
  );
}

/** Aperçu de la FAQ (3 questions) et lien vers la FAQ complète. */
export function FaqPreviewSection() {
  return (
    <section className={`border-t border-border px-5 py-8 lg:py-14 ${landingSection}`}>
      <div className="lg:mx-auto lg:max-w-3xl">
        <h2 className="text-xl font-bold text-foreground lg:text-3xl">Questions fréquentes</h2>
        <div className="mt-4 divide-y divide-border rounded-md border border-border">
          {faqPreview.map(({ q, a }) => (
            <details key={q} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="h-4 w-4 shrink-0 text-subtle transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
        <Link to="/pro/faq" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-strong no-underline">
          Toutes les questions
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/** Bandeau final orange avec le bouton principal. */
export function FinalCta({ loggedIn, title }: { loggedIn: boolean; title: string }) {
  return (
    <section className={`bg-accent px-5 py-8 text-center lg:py-14 ${landingSection}`}>
      <h2 className="text-xl font-bold text-accent-foreground lg:text-3xl">
        {loggedIn ? 'Votre semaine est-elle publiée ?' : title}
      </h2>
      <p className="mt-1 text-sm text-accent-foreground/90">
        {loggedIn
          ? 'Retrouvez vos plats et votre équipe dans votre espace'
          : 'Inscription avec votre portable et votre SIRET'}
      </p>
      <div className="mt-5 lg:mx-auto lg:mt-8 lg:max-w-md">
        <MainCta loggedIn={loggedIn} inverted />
      </div>
    </section>
  );
}

/** Pastilles de réassurance. */
export function ReassuranceRow() {
  return (
    <ul className="grid grid-cols-3 gap-2 lg:mx-auto lg:max-w-2xl">
      {reassurance.map(({ icon: Icon, label }) => (
        <li key={label} className="flex flex-col items-center gap-1.5 text-center text-xs font-semibold text-foreground">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Icon className="h-5 w-5" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}
