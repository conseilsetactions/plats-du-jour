// A/B test de la liste des plats sur ordinateur (SIMULÉ : mesures stockées dans le navigateur, lues par /admin).
// A = ardoise (tableau), C = liste + plan. Seuls les visiteurs avec le GPS activé participent :
// sans GPS, on affiche toujours le plan (C), le seul moyen de situer les établissements.

import { track } from '@/lib/analytics';

export type ListVariant = 'a' | 'c';

export const LIST_VARIANTS: Record<ListVariant, string> = {
  a: 'A · Ardoise (tableau)',
  c: 'C · Liste et plan',
};

export type ListEventType = 'view' | 'plat_click';

interface ListEvent {
  type: ListEventType;
  variant: ListVariant;
  at: string;
}

const VARIANT_KEY = 'pdj:ab-list-variant';
const EVENTS_KEY = 'pdj:ab-list-events';

const isVariant = (value: unknown): value is ListVariant => value === 'a' || value === 'c';

/**
 * Version attribuée à ce visiteur : tirée au sort une fois, puis conservée.
 * `?liste=a` ou `?liste=c` dans l'adresse force une version (pratique pour les tests).
 */
export const getListVariant = (): ListVariant => {
  try {
    const forced = new URLSearchParams(window.location.search).get('liste');
    if (isVariant(forced)) {
      localStorage.setItem(VARIANT_KEY, forced);
      return forced;
    }
    const saved = localStorage.getItem(VARIANT_KEY);
    if (isVariant(saved)) return saved;
    const drawn: ListVariant = Math.random() < 0.5 ? 'a' : 'c';
    localStorage.setItem(VARIANT_KEY, drawn);
    return drawn;
  } catch {
    return 'c';
  }
};

export const getListEvents = (): ListEvent[] => {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export const trackList = (type: ListEventType, variant: ListVariant) => {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify([...getListEvents(), { type, variant, at: new Date().toISOString() }]));
    track(`liste-${type}`, { version: variant }); // mesure réelle (Umami)
  } catch {
    // stockage indisponible : mesure perdue
  }
};

export const resetListAbTest = () => {
  try {
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(VARIANT_KEY);
  } catch {
    // stockage indisponible
  }
};
