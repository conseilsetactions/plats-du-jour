// Vérification d'un SIRET via l'API Recherche d'entreprises de l'État (gratuite, sans clé).
import type { Location } from '@/types';
import { DEMO_MODE } from '@/lib/demo';

export interface SiretInfo {
  siret: string;
  name: string; // enseigne, sinon nom commercial, sinon raison sociale
  street: string;
  postalCode: string;
  city: string;
  location: Location | null;
}

export type SiretResult =
  | { ok: true; info: SiretInfo }
  | { ok: false; error: string };

/**
 * SIRET FICTIFS pour tester (module « Démo » en bas à gauche).
 * Reconnus seulement en mode démo (lib/demo.ts), jamais une fois le site lancé pour de vrai.
 */
export const TEST_SIRETS: SiretInfo[] = [
  {
    siret: '99900000000011',
    name: 'Chez Paulette (test)',
    street: '12 Rue Sainte',
    postalCode: '13001',
    city: 'Marseille',
    location: { latitude: 43.2928, longitude: 5.3712 },
  },
  {
    siret: '99900000000029',
    name: 'Le Comptoir Joliette (test)',
    street: '20 Quai de la Joliette',
    postalCode: '13002',
    city: 'Marseille',
    location: { latitude: 43.3048, longitude: 5.3662 },
  },
  {
    siret: '99900000000037',
    name: 'Boulangerie du Port (test)',
    street: '5 Quai du Port',
    postalCode: '13002',
    city: 'Marseille',
    location: { latitude: 43.2965, longitude: 5.3705 },
  },
  {
    siret: '99900000000045',
    name: 'Traiteur des Docks (test)',
    street: '10 Place de la Joliette',
    postalCode: '13002',
    city: 'Marseille',
    location: { latitude: 43.3062, longitude: 5.3678 },
  },
  {
    siret: '99900000000052',
    name: 'La Table du Panier (test)',
    street: '8 Rue du Panier',
    postalCode: '13002',
    city: 'Marseille',
    location: { latitude: 43.2989, longitude: 5.3683 },
  },
  {
    siret: '99900000000060',
    name: 'Pizzeria Belsunce (test)',
    street: '31 Cours Belsunce',
    postalCode: '13001',
    city: 'Marseille',
    location: { latitude: 43.2992, longitude: 5.3771 },
  },
  {
    siret: '99900000000078',
    name: 'Le Bistrot des Terrasses (test)',
    street: '9 Quai du Lazaret',
    postalCode: '13002',
    city: 'Marseille',
    location: { latitude: 43.3071, longitude: 5.3655 },
  },
  {
    siret: '99900000000086',
    name: 'Saveurs du Liban (test)',
    street: '14 Rue de la République',
    postalCode: '13002',
    city: 'Marseille',
    location: { latitude: 43.3005, longitude: 5.3712 },
  },
  {
    siret: '99900000000094',
    name: 'La Criée Gourmande (test)',
    street: '2 Quai de Rive Neuve',
    postalCode: '13007',
    city: 'Marseille',
    location: { latitude: 43.2928, longitude: 5.3705 },
  },
  {
    siret: '99900000000102',
    name: 'Green Bowl Euroméditerranée (test)',
    street: '40 Boulevard de Dunkerque',
    postalCode: '13002',
    city: 'Marseille',
    location: { latitude: 43.3082, longitude: 5.3689 },
  },
  {
    siret: '99900000000110',
    name: 'Chez Fanny, traiteur (test)',
    street: '6 Rue Saint-Saëns',
    postalCode: '13001',
    city: 'Marseille',
    location: { latitude: 43.2947, longitude: 5.3772 },
  },
  {
    // Hors zone couverte : pour tester le message « pas encore disponible »
    siret: '99900000000128',
    name: 'Le Cours Mirabeau (test, Aix)',
    street: '20 Cours Mirabeau',
    postalCode: '13100',
    city: 'Aix-en-Provence',
    location: { latitude: 43.5263, longitude: 5.4474 },
  },
];

/** Contrôle de format (14 chiffres + clé de Luhn, sauf exception La Poste). */
export const isValidSiretFormat = (siret: string) => {
  if (!/^\d{14}$/.test(siret)) return false;
  if (siret.startsWith('356000000')) return true; // établissements de La Poste
  const sum = [...siret].reverse().reduce((acc, char, i) => {
    let digit = Number(char);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    return acc + digit;
  }, 0);
  return sum % 10 === 0;
};

const SMALL_WORDS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'l', 'd', 'et', 'au', 'aux', 'en', 'sur', 'sous']);

// "16-18 RUE DE LA REPUBLIQUE" -> "16-18 Rue de la Republique"
const capitalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L}+)/gu, (_, sep, word: string) =>
      sep + (sep && SMALL_WORDS.has(word) ? word : word[0].toUpperCase() + word.slice(1))
    );

export const lookupSiret = async (rawSiret: string): Promise<SiretResult> => {
  const siret = rawSiret.replace(/\s/g, '');
  if (!isValidSiretFormat(siret)) {
    return { ok: false, error: 'Numéro SIRET invalide (14 chiffres)' };
  }
  if (DEMO_MODE) {
    const test = TEST_SIRETS.find((t) => t.siret === siret);
    if (test) return { ok: true, info: test };
  }

  let data;
  try {
    const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siret}`);
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch {
    return { ok: false, error: 'Vérification impossible pour le moment. Réessayez dans un instant' };
  }

  const company = data.results?.[0];
  const etablissement = [...(company?.matching_etablissements ?? []), company?.siege].find(
    (e) => e?.siret === siret
  );
  if (!etablissement) {
    return { ok: false, error: 'Aucun établissement trouvé avec ce SIRET' };
  }
  if (etablissement.etat_administratif !== 'A') {
    return { ok: false, error: 'Cet établissement est indiqué comme fermé' };
  }
  // Toutes les activités sont acceptées (restaurants, traiteurs, boulangeries…)

  // "16-18 RUE DE LA REPUBLIQUE 13001 MARSEILLE"
  const match = String(etablissement.adresse ?? '').match(/^(.*?)\s*(\d{5})\s+(.+)$/);
  const name =
    etablissement.liste_enseignes?.[0] ?? etablissement.nom_commercial ?? company.nom_complet ?? '';
  const lat = Number(etablissement.latitude);
  const lng = Number(etablissement.longitude);

  return {
    ok: true,
    info: {
      siret,
      name: capitalize(name),
      street: capitalize(match?.[1] ?? etablissement.adresse ?? ''),
      postalCode: match?.[2] ?? etablissement.code_postal ?? '',
      city: capitalize(match?.[3] ?? etablissement.libelle_commune ?? ''),
      location: Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 ? { latitude: lat, longitude: lng } : null,
    },
  };
};
