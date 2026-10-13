// Recherche de l'établissement sur Google Maps (inscription pro, à la place du SIRET).
// Le nom, l'adresse, la position et la note viennent de la fiche Google de l'établissement.
// - Avec VITE_GOOGLE_MAPS_API_KEY : vraie recherche Google (Maps JavaScript API + Places API « New »).
// - En mode démo : établissements fictifs (« test ») trouvables par leur nom, avec ou sans clé.
import { DEMO_MODE } from '@/lib/demo';
import type { Location } from '@/types';

export interface PlaceInfo {
  placeId: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  location: Location;
  rating?: number; // note Google (sur 5)
  ratingCount?: number; // nombre d'avis Google
  mapsUrl?: string; // lien vers la fiche Google
}

export type PlaceSearchResult = { ok: true; places: PlaceInfo[] } | { ok: false; error: string };

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
export const GOOGLE_PLACES_ENABLED = !!API_KEY;

/** Centre de recherche par défaut : Marseille (les résultats proches sont favorisés). */
const SEARCH_CENTER = { lat: 43.2965, lng: 5.3698 };

/** Établissements fictifs pour tester l'inscription (mode démo uniquement). */
export const DEMO_PLACES: PlaceInfo[] = [
  { placeId: 'demo-paulette', name: 'Chez Paulette (test)', street: '12 Rue Sainte', postalCode: '13001', city: 'Marseille', location: { latitude: 43.2928, longitude: 5.3712 }, rating: 4.4, ratingCount: 212 },
  { placeId: 'demo-comptoir', name: 'Le Comptoir Joliette (test)', street: '20 Quai de la Joliette', postalCode: '13002', city: 'Marseille', location: { latitude: 43.3048, longitude: 5.3662 }, rating: 4.3, ratingCount: 158 },
  { placeId: 'demo-boulangerie', name: 'Boulangerie du Port (test)', street: '5 Quai du Port', postalCode: '13002', city: 'Marseille', location: { latitude: 43.2965, longitude: 5.3705 }, rating: 4.6, ratingCount: 389 },
  { placeId: 'demo-traiteur', name: 'Traiteur des Docks (test)', street: '10 Place de la Joliette', postalCode: '13002', city: 'Marseille', location: { latitude: 43.3062, longitude: 5.3678 }, rating: 4.1, ratingCount: 74 },
  { placeId: 'demo-panier', name: 'La Table du Panier (test)', street: '8 Rue du Panier', postalCode: '13002', city: 'Marseille', location: { latitude: 43.2989, longitude: 5.3683 }, rating: 4.5, ratingCount: 301 },
  { placeId: 'demo-belsunce', name: 'Pizzeria Belsunce (test)', street: '31 Cours Belsunce', postalCode: '13001', city: 'Marseille', location: { latitude: 43.2992, longitude: 5.3771 }, rating: 4.2, ratingCount: 120 },
  { placeId: 'demo-terrasses', name: 'Le Bistrot des Terrasses (test)', street: '9 Quai du Lazaret', postalCode: '13002', city: 'Marseille', location: { latitude: 43.3071, longitude: 5.3655 }, rating: 4.0, ratingCount: 95 },
  { placeId: 'demo-liban', name: 'Saveurs du Liban (test)', street: '14 Rue de la République', postalCode: '13002', city: 'Marseille', location: { latitude: 43.3005, longitude: 5.3712 }, rating: 4.7, ratingCount: 268 },
  { placeId: 'demo-criee', name: 'La Criée Gourmande (test)', street: '2 Quai de Rive Neuve', postalCode: '13007', city: 'Marseille', location: { latitude: 43.2928, longitude: 5.3705 }, rating: 4.3, ratingCount: 187 },
  { placeId: 'demo-greenbowl', name: 'Green Bowl Euroméditerranée (test)', street: '40 Boulevard de Dunkerque', postalCode: '13002', city: 'Marseille', location: { latitude: 43.3082, longitude: 5.3689 }, rating: 4.4, ratingCount: 63 },
  { placeId: 'demo-fanny', name: 'Chez Fanny, traiteur (test)', street: '6 Rue Saint-Saëns', postalCode: '13001', city: 'Marseille', location: { latitude: 43.2947, longitude: 5.3772 }, rating: 4.8, ratingCount: 42 },
  // Hors zone couverte : pour tester le message « pas encore disponible »
  { placeId: 'demo-aix', name: 'Le Cours Mirabeau (test, Aix)', street: '20 Cours Mirabeau', postalCode: '13100', city: 'Aix-en-Provence', location: { latitude: 43.5263, longitude: 5.4474 }, rating: 4.2, ratingCount: 510 },
];

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const searchDemoPlaces = (query: string) => {
  const q = normalize(query.trim());
  return DEMO_PLACES.filter((p) => normalize(`${p.name} ${p.street} ${p.city}`).includes(q));
};

// --- Google Maps JavaScript API, chargée seulement au moment de la recherche ---
let mapsLoading: Promise<void> | null = null;

const loadGoogleMaps = () => {
  if (mapsLoading) return mapsLoading;
  mapsLoading = new Promise<void>((resolve, reject) => {
    const callback = '__pdjGoogleMapsReady';
    (window as unknown as Record<string, () => void>)[callback] = () => resolve();
    const script = document.createElement('script');
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(API_KEY!)}` +
      `&v=weekly&loading=async&language=fr&region=FR&callback=${callback}`;
    script.async = true;
    script.onerror = () => {
      mapsLoading = null;
      reject(new Error('Google Maps indisponible'));
    };
    document.head.appendChild(script);
  });
  return mapsLoading;
};

type AddressComponent = { types: string[]; longText?: string | null };

const component = (components: AddressComponent[] | undefined, type: string) =>
  components?.find((c) => c.types.includes(type))?.longText ?? '';

const searchGooglePlaces = async (query: string): Promise<PlaceInfo[]> => {
  await loadGoogleMaps();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const google = (window as any).google;
  const { Place } = await google.maps.importLibrary('places');
  const { places } = await Place.searchByText({
    textQuery: query,
    fields: ['id', 'displayName', 'addressComponents', 'formattedAddress', 'location', 'rating', 'userRatingCount', 'googleMapsURI'],
    locationBias: { center: SEARCH_CENTER, radius: 30000 },
    maxResultCount: 6,
    language: 'fr',
    region: 'fr',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (places ?? []).map((p: any): PlaceInfo => {
    const components = p.addressComponents as AddressComponent[] | undefined;
    const street = [component(components, 'street_number'), component(components, 'route')].filter(Boolean).join(' ');
    return {
      placeId: p.id,
      name: p.displayName ?? '',
      street: street || (p.formattedAddress ?? '').split(',')[0],
      postalCode: component(components, 'postal_code'),
      city: component(components, 'locality'),
      location: { latitude: p.location.lat(), longitude: p.location.lng() },
      rating: p.rating ?? undefined,
      ratingCount: p.userRatingCount ?? undefined,
      mapsUrl: p.googleMapsURI ?? undefined,
    };
  });
};

/** Cherche un établissement par son nom (et éventuellement sa rue). */
export const searchPlaces = async (query: string): Promise<PlaceSearchResult> => {
  if (query.trim().length < 2) return { ok: false, error: 'Tapez au moins 2 lettres du nom de votre établissement' };
  const demo = DEMO_MODE ? searchDemoPlaces(query) : [];
  if (!GOOGLE_PLACES_ENABLED) {
    if (DEMO_MODE) return { ok: true, places: demo };
    return { ok: false, error: 'La recherche est momentanément indisponible. Réessayez plus tard' };
  }
  try {
    return { ok: true, places: [...demo, ...(await searchGooglePlaces(query))] };
  } catch {
    return demo.length
      ? { ok: true, places: demo }
      : { ok: false, error: 'Recherche impossible pour le moment. Réessayez dans un instant' };
  }
};
