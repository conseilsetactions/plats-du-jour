// Positions GPS simulées pour la démo (module « Démo », en développement uniquement).
import type { Location } from '@/types';

export const DEMO_GPS_KEY = 'pdj:demo-gps';

export const DEMO_POSITIONS: { label: string; address: string; location: Location }[] = [
  {
    label: 'Joliette',
    address: 'Place de la Joliette, 13002 Marseille',
    location: { latitude: 43.3047, longitude: 5.3667 },
  },
  {
    label: 'Vieux-Port',
    address: 'Quai du Port (Hôtel de Ville), 13002 Marseille',
    location: { latitude: 43.2958, longitude: 5.3698 },
  },
  {
    label: 'Ailleurs, sans restaurant',
    address: 'Cours Mirabeau, 13100 Aix-en-Provence',
    location: { latitude: 43.5262, longitude: 5.4469 },
  },
];

/** Position simulée active (null : vrai GPS du téléphone). */
export const getDemoGps = (): Location | null => {
  if (!import.meta.env.DEV) return null;
  try {
    return JSON.parse(sessionStorage.getItem(DEMO_GPS_KEY) ?? 'null');
  } catch {
    return null;
  }
};

/** Active une position simulée (ou le vrai GPS avec null), puis recharge la liste des plats en mode GPS. */
export const setDemoGps = (location: Location | null) => {
  try {
    if (location) {
      sessionStorage.setItem(DEMO_GPS_KEY, JSON.stringify(location));
      localStorage.setItem(
        'pdj:user-location',
        JSON.stringify({ location, consentGiven: true, timestamp: new Date().toISOString() })
      );
      localStorage.setItem('pdj:geolocation-consent', 'true');
      // Le GPS remplace le quartier choisi
      const zone = JSON.parse(localStorage.getItem('pdj:zone') ?? 'null');
      if (zone) localStorage.setItem('pdj:zone', JSON.stringify({ ...zone, quartier: null }));
    } else {
      sessionStorage.removeItem(DEMO_GPS_KEY);
      localStorage.removeItem('pdj:user-location');
    }
  } catch {
    // stockage indisponible
  }
  window.location.href = '/';
};
