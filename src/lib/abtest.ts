// A/B test de la landing pro (SIMULÉ : mesures stockées dans le navigateur, lues par /admin).
// En vrai : un outil de mesure côté serveur (ou un service d'analytics) pour agréger tous les visiteurs.

export type Variant = 'a' | 'b';

export const VARIANTS: Record<Variant, string> = {
  a: 'A · Présentation (actuelle)',
  b: 'B · Problèmes et arguments',
};

export type AbEventType = 'view' | 'signup_click' | 'signup_complete';

export interface AbEvent {
  type: AbEventType;
  variant: Variant;
  at: string;
}

const VARIANT_KEY = 'pdj:ab-variant';
const EVENTS_KEY = 'pdj:ab-events';

/**
 * Version attribuée à ce visiteur : tirée au sort à la première visite, puis conservée.
 * `?version=a` ou `?version=b` dans l'adresse force une version (pratique pour les tests).
 */
export const getVariant = (): Variant => {
  try {
    const forced = new URLSearchParams(window.location.search).get('version');
    if (forced === 'a' || forced === 'b') {
      localStorage.setItem(VARIANT_KEY, forced);
      return forced;
    }
    const saved = localStorage.getItem(VARIANT_KEY);
    if (saved === 'a' || saved === 'b') return saved;
    const drawn: Variant = Math.random() < 0.5 ? 'a' : 'b';
    localStorage.setItem(VARIANT_KEY, drawn);
    return drawn;
  } catch {
    return 'a';
  }
};

/** Version déjà attribuée (sans en tirer une nouvelle), pour attribuer une inscription. */
const assignedVariant = (): Variant | null => {
  try {
    const saved = localStorage.getItem(VARIANT_KEY);
    return saved === 'a' || saved === 'b' ? saved : null;
  } catch {
    return null;
  }
};

export const getAbEvents = (): AbEvent[] => {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export const trackAb = (type: AbEventType, variant: Variant | null = assignedVariant()) => {
  if (!variant) return; // visiteur arrivé sans passer par la landing : non compté
  try {
    const events = [...getAbEvents(), { type, variant, at: new Date().toISOString() }];
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {
    // stockage indisponible : mesure perdue
  }
};

export const resetAbTest = () => {
  try {
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(VARIANT_KEY);
  } catch {
    // stockage indisponible
  }
};
