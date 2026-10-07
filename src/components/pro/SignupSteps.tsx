import { ChevronLeft } from 'lucide-react';

/** Les étapes de l'inscription pro, dans l'ordre. */
export const SIGNUP_STEPS = ['Formule', 'Portable', 'Mot de passe', 'Établissement', 'Paiement'] as const;
export type SignupStep = (typeof SIGNUP_STEPS)[number];

/** Barre de progression de l'inscription : « Étape 2 sur 5 · Portable ». */
export default function SignupSteps({ current, onBack }: { current: SignupStep; onBack?: () => void }) {
  const index = SIGNUP_STEPS.indexOf(current);
  return (
    <div className="border-b border-border bg-muted px-4 py-3">
      <div className="flex items-center gap-2 text-xs">
        {onBack ? (
          <button onClick={onBack} className="-ml-1 inline-flex items-center gap-0.5 font-medium text-accent">
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>
        ) : (
          <span className="font-semibold uppercase tracking-wide text-accent-strong">Inscription</span>
        )}
        <span className="ml-auto text-muted-foreground">
          Étape {index + 1} sur {SIGNUP_STEPS.length} · <span className="font-semibold text-foreground">{current}</span>
        </span>
      </div>
      <ol className="mt-2 grid grid-cols-5 gap-1" aria-label="Étapes de l'inscription">
        {SIGNUP_STEPS.map((step, i) => (
          <li
            key={step}
            aria-current={i === index ? 'step' : undefined}
            title={step}
            className={`h-1.5 rounded-full ${i <= index ? 'bg-accent' : 'bg-border'}`}
          >
            <span className="sr-only">
              {step}
              {i < index ? ' (fait)' : i === index ? ' (en cours)' : ''}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
