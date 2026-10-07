// Jours d'ouverture d'un établissement (du lundi au vendredi : les jours où l'on publie un plat du jour).
// Un jour fermé : pas de plat à saisir, pas de SMS de rappel, pas compté dans la régularité.

export const WEEKDAYS = [
  { day: 1, short: 'Lun', long: 'lundi' },
  { day: 2, short: 'Mar', long: 'mardi' },
  { day: 3, short: 'Mer', long: 'mercredi' },
  { day: 4, short: 'Jeu', long: 'jeudi' },
  { day: 5, short: 'Ven', long: 'vendredi' },
] as const;

/** Par défaut (et pour les établissements créés avant cette option) : ouvert du lundi au vendredi. */
export const DEFAULT_OPEN_DAYS = [1, 2, 3, 4, 5];

export const getOpenDays = (restaurant: { openDays?: number[] }) => restaurant.openDays ?? DEFAULT_OPEN_DAYS;

/** L'établissement est-il ouvert ce jour-là (0 = dimanche … 6 = samedi) ? */
export const isOpenOn = (restaurant: { openDays?: number[] }, date: Date) =>
  getOpenDays(restaurant).includes(date.getDay());

/** « Ouvert du lundi au vendredi » / « Ouvert lundi, mardi, jeudi » */
export const formatOpenDays = (openDays: number[]) => {
  if (openDays.length === 5) return 'Ouvert du lundi au vendredi';
  const names = WEEKDAYS.filter((w) => openDays.includes(w.day)).map((w) => w.long);
  return `Ouvert ${names.join(', ')}`;
};
