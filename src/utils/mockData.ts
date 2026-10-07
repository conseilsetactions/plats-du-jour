import type { Restaurant, Plat, Location } from '@/types';
import { proStore, type useProDb } from '@/lib/proStore';

// Villes couvertes et leurs quartiers (centres approximatifs).
// Ajouter une ville = ajouter une entrée ici.
export const CITIES = {
  Marseille: {
    postalCode: /^130(0[1-9]|1[0-6])$/,
    postalCodeHint: '13001 à 13016',
    quartiers: {
      'Joliette': { lat: 43.3045, lng: 5.3665 },
      'Vieux Port': { lat: 43.2951, lng: 5.374 },
    } as Record<string, { lat: number; lng: number }>,
  },
};

export type City = keyof typeof CITIES;

export const CITY_NAMES = Object.keys(CITIES) as City[];

export const isCity = (value: string): value is City => value in CITIES;

export const DEFAULT_CITY: City = 'Marseille';

export const getQuartiers = (city: City): string[] =>
  Object.keys(CITIES[city].quartiers).sort((a, b) => a.localeCompare(b, 'fr'));

export const getQuartierCenter = (city: City, quartier: string): Location | null => {
  const center = CITIES[city]?.quartiers[quartier];
  return center ? { latitude: center.lat, longitude: center.lng } : null;
};

const DEFAULT_RADIUS = 3000; // en mètres

// Un plat du jour par restaurant : [id, restaurant, rue, quartier, CP, lat, lng, plat, prix, note Google (démo)]
type MockRow = [string, string, string, string, string, number, number, string, number, number];

const rows: MockRow[] = [
  ['1', 'Le Vieux Port', '13 Quai des Belges', 'Vieux Port', '13001', 43.2953, 5.3746, 'Bouillabaisse du pêcheur', 14.5, 4.5],
  ['2', 'Chez Michel', '45 Rue Sainte', 'Vieux Port', '13001', 43.2928, 5.3712, 'Daurade grillée, légumes du soleil', 13.9, 4.2],
  ['3', 'Bouillabaisse des Îles', '58 La Canebière', 'Canebière', '13001', 43.2981, 5.3792, 'Soupe de poissons maison', 11, 4.7],
  ['4', 'La Paella', '22 Rue du Panier', 'Vieux Port', '13002', 43.2985, 5.3688, 'Paella valenciana', 12, 4.4],
  ['5', 'Casa Italia', '15 Place aux Huiles', 'Vieux Port', '13001', 43.2932, 5.3728, 'Linguine aux palourdes', 12.5, 4.3],
  ['6', 'Sandwich Paris', '67 Rue de la République', 'Canebière', '13002', 43.2998, 5.3735, 'Jambon-beurre & salade', 6.5, 3.9],
  ['7', 'Trattoria Napoli', '89 Rue Grignan', 'Castellane', '13006', 43.2905, 5.3782, 'Pizza margherita', 9.5, 4.6],
  ['8', 'Bouchon Lyonnais', '34 Rue Fortia', 'Vieux Port', '13001', 43.2925, 5.3735, 'Quenelle sauce Nantua', 13, 4.5],
  ['9', 'Le Grill Express', '12 Quai du Port', 'Vieux Port', '13002', 43.2965, 5.3705, 'Steak frites', 11.5, 4.1],
  ['10', 'Poke House', '23 Rue Théophile Gautier', 'Canebière', '13001', 43.2995, 5.3825, 'Poke bowl saumon', 10.9, 4.3],
  ['11', 'Kebab du Jour', '78 Rue Colbert', 'Canebière', '13001', 43.2992, 5.3765, 'Assiette kebab', 7.5, 3.8],
  ['12', 'Crêperie Bretonne', '91 Boulevard Longchamp', 'La Plaine', '13001', 43.3005, 5.3905, 'Galette complète', 8, 4.2],
  ['13', 'Burger des Amis', '45 Rue Venture', 'Vieux Port', '13001', 43.2938, 5.3762, 'Burger maison & frites', 10.5, 4.0],
  ['14', 'Sushi Master', '56 Rue Paradis', 'Castellane', '13006', 43.289, 5.3795, 'Chirashi saumon', 12.9, 4.4],
  ['15', 'Le Petit Bistro', '12 Rue d\'Endoume', 'Endoume', '13007', 43.2835, 5.3565, 'Blanquette de veau', 12, 4.5],
  ['16', 'Asian Fusion', '78 Rue Beauvau', 'Vieux Port', '13001', 43.2945, 5.3758, 'Bo bun bœuf', 9.9, 4.3],
  ['17', 'Pizzeria Antonio', '34 Rue de Lodi', 'Castellane', '13006', 43.2875, 5.3868, 'Pizza 4 fromages', 10, 4.4],
  ['18', 'Le Comptoir', '23 Rue Caisserie', 'Vieux Port', '13002', 43.2972, 5.3695, 'Pieds paquets', 13.5, 4.6],
  ['19', 'Salade & Cie', '67 Rue de Rome', 'Castellane', '13006', 43.2915, 5.3818, 'Salade niçoise', 8.5, 4.1],
  ['20', 'Smokehouse', '45 Rue des Trois Mages', 'La Plaine', '13006', 43.2935, 5.3865, 'Travers de porc fumé', 14, 4.5],
  ['21', 'Phở Saigon', '12 Rue de la Loge', 'Vieux Port', '13002', 43.2962, 5.3718, 'Phở bœuf', 9.5, 4.2],
  ['22', 'Couscous Palace', '89 Rue de Lodi', 'La Plaine', '13006', 43.2918, 5.3895, 'Couscous royal', 12.5, 4.3],
  ['23', 'Empanada Delicia', '34 Rue Ferrari', 'La Plaine', '13005', 43.2958, 5.3912, 'Trio d\'empanadas', 7, 4.0],
  ['24', 'Thai Express', '56 Rue Sainte', 'Vieux Port', '13007', 43.2915, 5.3695, 'Pad thaï crevettes', 10.5, 4.4],
  ['25', 'Café de la Plaine', '78 Place Jean Jaurès', 'La Plaine', '13005', 43.2948, 5.3885, 'Croque-monsieur & salade', 7.9, 4.2],
  ['26', 'Le Vallon', '5 Vallon des Auffes', 'Endoume', '13007', 43.2852, 5.3505, 'Aïoli du vendredi', 15, 4.7],
  ['27', 'Le Cabanon', '8 Place Malaval', 'Estaque', '13016', 43.3612, 5.3125, 'Panisses & encornets', 11, 4.4],
  ['28', 'Chez Rosa', '20 Plage de l\'Estaque', 'Estaque', '13016', 43.3598, 5.3165, 'Moules frites', 12, 4.1],
  ['29', 'Les Docks Café', '10 Place de la Joliette', 'Joliette', '13002', 43.3062, 5.3678, 'Poulet rôti, pommes grenaille', 12.5, 4.4],
  ['30', 'La Table de la Major', '2 Rue de la Major', 'Joliette', '13002', 43.3008, 5.3655, 'Risotto aux cèpes', 13, 4.6],
];

// Restaurants de démo en formule Menu : plusieurs lignes par jour [catégorie, nom, prix]
const MENUS: Record<string, [string, string, number][]> = {
  '2': [
    ['Entrée', 'Soupe de poissons', 8],
    ['Plat', 'Daurade grillée, légumes du soleil', 13.9],
    ['Dessert', 'Panna cotta à la figue', 5.5],
    ['Formule', 'Entrée + plat + dessert', 24],
  ],
  '18': [
    ['Entrée', 'Panisses et aïoli', 6],
    ['Plat', 'Pieds paquets', 13.5],
    ['Dessert', 'Navettes et café', 4.5],
  ],
  '29': [
    ['Entrée', 'Salade de chèvre chaud', 7],
    ['Plat', 'Poulet rôti, pommes grenaille', 12.5],
    ['Plat', 'Pavé de saumon, riz noir', 14],
    ['Dessert', 'Tarte au citron meringuée', 5],
    ['Formule', 'Plat + dessert', 16],
  ],
};

const allPlats: Plat[] = rows.flatMap(
  ([id, name, street, quartier, postalCode, latitude, longitude, platName, price, rating]) => {
    const restaurant: Restaurant = {
      id,
      name,
      address: { street, quartier, city: 'Marseille', postalCode },
      location: { latitude, longitude },
      rating,
      distance: 0,
    };
    const menu = MENUS[id];
    if (!menu) return [{ id, name: platName, description: '', price, restaurant }];
    return menu.map(([category, itemName, itemPrice], i) => ({
      id: `${id}-${i}`,
      name: itemName,
      description: '',
      price: itemPrice,
      category,
      restaurant,
    }));
  }
);

export const calculateDistance = (
  loc1: Location,
  loc2: Location
): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const dLng = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.latitude * Math.PI) / 180) *
      Math.cos((loc2.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in meters
};

const withDistance = (plat: Plat, userLocation: Location): Plat => ({
  ...plat,
  restaurant: {
    ...plat.restaurant,
    distance: calculateDistance(userLocation, plat.restaurant.location),
  },
});

/** Convertit les plats publiés aujourd'hui par les restaurateurs au format de la page d'accueil. */
export const publishedToPlats = (db: ReturnType<typeof useProDb>): Plat[] =>
  proStore.getTodayPlats(db).map(({ plat, restaurant }) => ({
    id: plat.id,
    name: plat.name,
    description: '',
    price: plat.price,
    category: plat.category,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      address: {
        street: restaurant.street,
        quartier: restaurant.quartier,
        city: restaurant.city,
        postalCode: restaurant.postalCode,
      },
      location: restaurant.location,
      distance: 0,
    },
  }));

export const getMockPlats = (
  userLocation: Location,
  published: Plat[] = [],
  radius = DEFAULT_RADIUS
) => {
  const plats = [...published, ...allPlats]
    .map((plat) => withDistance(plat, userLocation))
    .filter((plat) => plat.restaurant.distance <= radius)
    .sort((a, b) => a.restaurant.distance - b.restaurant.distance);
  return {
    plats,
    restaurants: plats.map((plat) => plat.restaurant),
  };
};

export const getMockRestaurants = (userLocation: Location): Restaurant[] => {
  return getMockPlats(userLocation).restaurants;
};

export const getPlatById = (
  id: string,
  userLocation: Location | null,
  published: Plat[] = []
): Plat | null => {
  const plat = [...published, ...allPlats].find((p) => p.id === id);
  if (!plat) return null;
  return userLocation ? withDistance(plat, userLocation) : plat;
};
