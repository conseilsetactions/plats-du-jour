// Mesure du tunnel d'inscription pro (SIMULÉ : stocké dans le navigateur, lu par /admin).
// Objectif : savoir à quelle étape les restaurateurs abandonnent (cible : moins de 15 % d'abandon au paiement).
// En vrai : un outil de mesure côté serveur pour agréger tous les visiteurs.

export const FUNNEL_STEPS = [
  { id: 'formule', label: '1. Formule' },
  { id: 'portable', label: '2. Portable' },
  { id: 'code', label: '2. Code SMS' },
  { id: 'mot_de_passe', label: '3. Mot de passe' },
  { id: 'etablissement', label: '4. Établissement' },
  { id: 'paiement_intro', label: '5. Les 6 mois gratuits' },
  { id: 'paiement', label: '5. Paiement' },
  { id: 'termine', label: 'Inscription terminée' },
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number]['id'];

interface FunnelEvent {
  step: FunnelStep;
  at: string;
}

const EVENTS_KEY = 'pdj:funnel-events';
const SEEN_KEY = 'pdj:funnel-seen'; // étapes déjà comptées pendant cette visite (pas de double comptage)

export const getFunnelEvents = (): FunnelEvent[] => {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

/** Compte une étape vue, une seule fois par visite. */
export const trackFunnel = (step: FunnelStep) => {
  try {
    const seen: string[] = JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? '[]');
    if (seen.includes(step)) return;
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, step]));
    localStorage.setItem(EVENTS_KEY, JSON.stringify([...getFunnelEvents(), { step, at: new Date().toISOString() }]));
  } catch {
    // stockage indisponible : mesure perdue
  }
};

export const resetFunnel = () => {
  try {
    localStorage.removeItem(EVENTS_KEY);
    sessionStorage.removeItem(SEEN_KEY);
  } catch {
    // stockage indisponible
  }
};
