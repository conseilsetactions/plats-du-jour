// Mesure d'audience RÉELLE (tous les visiteurs additionnés), en plus des mesures de démo dans le navigateur.
// Outil : Umami (sans cookie, sans donnée personnelle → pas de bandeau de consentement).
// Actif seulement si VITE_UMAMI_WEBSITE_ID est renseigné (.env.production) : le script est alors ajouté
// à la page (voir vite.config.ts) et les événements ci-dessous sont envoyés.

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void };
  }
}

export const ANALYTICS_ENABLED = !!import.meta.env.VITE_UMAMI_WEBSITE_ID;

/** Envoie un événement à Umami (sans effet si l'outil n'est pas configuré ou bloqué). */
export const track = (event: string, data?: Record<string, string | number>) => {
  if (!ANALYTICS_ENABLED) return;
  try {
    window.umami?.track(event, data);
  } catch {
    // mesure perdue, sans conséquence pour le visiteur
  }
};
