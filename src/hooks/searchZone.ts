// Position de recherche du client, partagée par la liste et la fiche détail
// pour que distances et résultats soient identiques sur les deux pages.
import type { Location } from '@/types';
import {
  calculateDistance,
  CITY_NAMES,
  DEFAULT_CITY,
  getQuartierCenter,
  getQuartiers,
  isCity,
  type City,
} from '@/utils/mockData';

/** Au-delà de cette distance du quartier le plus proche, la zone n'est pas couverte. */
const MAX_GPS_DISTANCE = 15_000;

/** Ville et quartier les plus proches de la position GPS (null si aucune ville couverte n'est proche). */
export const findNearestZone = (location: Location): { city: City; quartier: string } | null => {
  let best: { city: City; quartier: string; distance: number } | null = null;
  for (const city of CITY_NAMES) {
    for (const quartier of getQuartiers(city)) {
      const center = getQuartierCenter(city, quartier);
      if (!center) continue;
      const distance = calculateDistance(location, center);
      if (!best || distance < best.distance) best = { city, quartier, distance };
    }
  }
  return best && best.distance <= MAX_GPS_DISTANCE ? { city: best.city, quartier: best.quartier } : null;
};

export interface Zone {
  city: City;
  quartier: string | null;
}

const ZONE_KEY = 'pdj:zone';

export const loadZone = (): Zone => {
  try {
    const saved = JSON.parse(localStorage.getItem(ZONE_KEY) ?? 'null');
    if (!saved || !isCity(saved.city)) return { city: DEFAULT_CITY, quartier: null };
    const quartier = getQuartiers(saved.city).includes(saved.quartier) ? saved.quartier : null;
    return { city: saved.city, quartier };
  } catch {
    return { city: DEFAULT_CITY, quartier: null };
  }
};

export const saveZone = (zone: Zone) => {
  try {
    localStorage.setItem(ZONE_KEY, JSON.stringify(zone));
  } catch {
    // stockage indisponible : le choix ne sera pas mémorisé
  }
};

/** Le quartier choisi prime sur le GPS. */
export const getSearchLocation = (zone: Zone, gpsLocation: Location | null): Location | null =>
  zone.quartier ? getQuartierCenter(zone.city, zone.quartier) : gpsLocation;
