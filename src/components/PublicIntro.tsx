import { Link } from '@tanstack/react-router';
import { ChevronDown, ChevronRight, Footprints, MapPin, Smartphone, Store, UtensilsCrossed, Wallet } from 'lucide-react';
import { FREE_MONTHS } from '@/lib/plans';
import { CITY_NAMES, getQuartiers, type City } from '@/utils/mockData';

const steps = [
  {
    icon: MapPin,
    title: 'Choisissez votre quartier',
    text: 'Ou activez le GPS pour voir ce qui se trouve autour de vous',
  },
  {
    icon: UtensilsCrossed,
    title: 'Comparez les plats du jour',
    text: 'Tous les plats du jour du quartier, leur prix, le temps de marche et la note Google des établissements en un coup d’œil',
  },
  {
    icon: Footprints,
    title: 'Allez-y à pied',
    text: 'L’adresse et l’itinéraire sont sur la fiche de chaque plat',
  },
];

const benefits = [
  { icon: Wallet, title: 'Gratuit', text: 'Pour vous, Plats du Jour est entièrement gratuit' },
  { icon: Smartphone, title: 'Sans compte', text: 'Pas d’inscription ni d’application à télécharger' },
  { icon: Store, title: 'À jour', text: 'Ce sont les établissements eux-mêmes qui publient leur plat du jour' },
];

const faq = [
  {
    q: 'Pourquoi seulement de 11h à 14h ?',
    a: 'Les plats du jour sont servis le midi. En dehors de ces horaires, la liste est masquée pour ne jamais vous montrer un plat qui n’est plus servi',
  },
  {
    q: 'Faut-il réserver ou commander ?',
    a: 'Non. Cependant, nous ne pouvons pas garantir le nombre de plats disponibles dans chaque établissement. Vérifiez auprès de l’établissement concerné si nécessaire',
  },
  {
    q: 'D’où viennent les plats affichés ?',
    a: 'Plats du Jour affiche uniquement les plats du jour saisis par les établissements participants. Nous sommes un simple service d’affichage : chaque établissement reste responsable de ses plats, de ses prix et de leur disponibilité',
  },
  {
    q: 'Mon restaurant préféré n’y est pas',
    a: 'Parlez-lui de Plats du Jour : l’inscription est simple et les premiers mois sont offerts',
  },
];

interface PublicIntroProps {
  /** Sélectionne un quartier depuis la liste des quartiers disponibles. */
  onPickQuartier: (city: City, quartier: string) => void;
}

/** Présentation du site au grand public, affichée quand aucun plat n'est à montrer. */
export default function PublicIntro({ onPickQuartier }: PublicIntroProps) {
  return (
    <div className="border-t border-border lg:mt-6 lg:overflow-hidden lg:rounded-xl lg:border lg:bg-card">
      {/* Comment ça marche */}
      <section className="px-4 py-6 lg:px-6">
        <h2 className="text-lg font-bold text-foreground">Le midi, on mange quoi ?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Plats du Jour réunit les plats du jour des restaurants, traiteurs et boulangeries de votre quartier
        </p>
        <ol className="mt-5 space-y-4 lg:grid lg:grid-cols-3 lg:gap-5 lg:space-y-0">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-3 lg:flex-col">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-foreground text-[10px] font-bold text-card">
                  {i + 1}
                </span>
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{title}</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Avantages */}
      <section className="border-t border-border bg-muted px-4 py-5 lg:px-6">
        <ul className="grid grid-cols-3 gap-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li key={title} className="text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-1.5 block text-[13px] font-semibold text-foreground">{title}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Quartiers couverts */}
      <section className="border-t border-border px-4 py-6 lg:px-6">
        <h2 className="text-base font-semibold text-foreground">Où trouver des plats du jour ?</h2>
        {CITY_NAMES.map((city) => (
          <div key={city} className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{city}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {getQuartiers(city).map((quartier) => (
                <button
                  key={quartier}
                  onClick={() => {
                    onPickQuartier(city, quartier);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  {quartier}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="mt-3 text-xs text-muted-foreground">D’autres quartiers et d’autres villes arrivent bientôt</p>
      </section>

      {/* Questions fréquentes */}
      <section className="border-t border-border px-4 py-6 lg:px-6">
        <h2 className="text-base font-semibold text-foreground">Questions fréquentes</h2>
        <div className="mt-3 divide-y divide-border rounded-md border border-border">
          {faq.map(({ q, a }) => (
            <details key={q} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="h-4 w-4 shrink-0 text-subtle transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Restaurateurs */}
      <section className="border-t border-border bg-accent-soft px-4 py-5 lg:px-6">
        <Link to="/pro" className="flex items-center gap-3 no-underline">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Store className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-foreground">Vous tenez un restaurant ?</span>
            <span className="text-[13px] text-muted-foreground">
              Publiez votre plat du jour en 30 secondes. {FREE_MONTHS} mois offerts
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-accent" />
        </Link>
      </section>
    </div>
  );
}
