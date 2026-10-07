// Mode démo : outils de test (module « Démo », heure et GPS simulés, SIRET de test).
// Toujours actif sur l'ordinateur de développement ; en ligne, réglé par VITE_DEMO_MODE (.env.production).
export const DEMO_MODE = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true';
