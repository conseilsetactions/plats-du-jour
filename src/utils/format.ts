import { getNow } from '@/lib/clock';

export const formatDistance = (meters: number): string => {
  const rounded = Math.round(meters / 10) * 10;
  return `${rounded.toLocaleString('fr-FR')} m`;
};

// Temps de marche ESTIMÉ (en attendant l'itinéraire piéton de Google) :
// distance à vol d'oiseau + 30 % pour les détours, à ~80 m par minute.
const WALK_DETOUR_FACTOR = 1.3;
const WALK_METERS_PER_MINUTE = 80;

export const walkingMinutes = (meters: number): number =>
  Math.max(1, Math.round((meters * WALK_DETOUR_FACTOR) / WALK_METERS_PER_MINUTE));

export const formatWalk = (meters: number): string => `${walkingMinutes(meters)} min`;

export const formatPrice = (price: number): string => {
  const value = Number.isInteger(price) ? String(price) : price.toFixed(2).replace('.', ',');
  return `${value}€`;
};

export const formatRating = (rating: number): string => rating.toFixed(1).replace('.', ',');

// "9,50" ou "9.5" -> 9.5 ; null si invalide
export const parsePrice = (input: string): number | null => {
  const value = Number(input.trim().replace(',', '.').replace('€', ''));
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
};

// Date locale au format AAAA-MM-JJ
export const dateKey = (date: Date = getNow()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// "lundi 6 octobre"
export const formatDay = (date: Date): string =>
  date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

// "06 12 34 56 78"
export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/^\+33/, '0').replace(/\D/g, '');
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ');
};

export const getPriceCategory = (
  price: number
): 'budget' | 'mid' | 'premium' => {
  if (price < 8) return 'budget';
  if (price <= 12) return 'mid';
  return 'premium';
};

export const filterByPriceRange = (
  price: number,
  category: 'all' | 'budget' | 'mid' | 'premium'
): boolean => {
  if (category === 'all') return true;
  return getPriceCategory(price) === category;
};
