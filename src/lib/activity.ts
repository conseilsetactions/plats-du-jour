// Régularité de publication des établissements (suivi admin : félicitations / relances / appels).
import { isOpenOn } from '@/lib/openDays';
import type { ProDbSnapshot, Restaurant } from '@/lib/proStore';
import { dateKey } from '@/utils/format';

/** Fenêtre d'observation : les 4 dernières semaines. */
export const ACTIVITY_WINDOW_DAYS = 28;
/** Un établissement inscrit depuis moins longtemps est « nouveau » (pas encore relancé). */
export const NEW_RESTAURANT_DAYS = 7;

export type Segment = 'top' | 'regular' | 'low' | 'new';

/**
 * Messages automatiques de suivi (en vrai : tâches planifiées côté serveur).
 * - SMS quotidien, jours ouvrés à 10h30, SEULEMENT si le plat du jour n'est pas publié ;
 *   son ton dépend de la catégorie du restaurateur (voir SMS.dailyReminder).
 * - E-mail de félicitations, vendredi à 15h, aux meilleurs publiants.
 */
export const FOLLOW_UP = {
  dailySms: { hour: 10, minute: 30, label: 'Jours ouvrés, 10h30' },
  congratsEmail: { weekday: 5, hour: 15, minute: 0, label: 'Vendredi 15h' },
};

/** Prochain envoi : un jour donné (0 = dimanche … 5 = vendredi) ou le prochain jour ouvré. */
export const nextOccurrence = (now: Date, hour: number, minute: number, weekday?: number) => {
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  const matches = (d: Date) => (weekday === undefined ? d.getDay() >= 1 && d.getDay() <= 5 : d.getDay() === weekday);
  while (next <= now || !matches(next)) {
    next.setDate(next.getDate() + 1);
    next.setHours(hour, minute, 0, 0);
  }
  return next;
};

export const SEGMENTS: Record<Segment, { label: string; hint: string }> = {
  top: { label: 'Meilleurs publiants', hint: 'Au moins 70 % des jours ouvrés' },
  regular: { label: 'Réguliers', hint: 'Entre 30 et 70 % des jours ouvrés' },
  low: { label: 'À relancer', hint: 'Moins de 30 % des jours ouvrés' },
  new: { label: 'Nouveaux', hint: `Inscrits depuis moins de ${NEW_RESTAURANT_DAYS} jours` },
};

export interface Activity {
  publishedDays: number; // jours ouvrés avec au moins un plat publié
  possibleDays: number; // jours ouvrés de la fenêtre (depuis l'inscription si plus récente)
  rate: number; // 0 à 1
  lastPublished: string | null; // AAAA-MM-JJ
  daysSinceLast: number | null;
  segment: Segment;
}

export const getActivity = (db: ProDbSnapshot, restaurant: Restaurant, now: Date): Activity => {
  const signupKey = dateKey(new Date(restaurant.certifiedAt));
  const todayKey = dateKey(now);
  const published = new Set(
    db.plats.filter((p) => p.restaurantId === restaurant.id && p.date <= todayKey).map((p) => p.date)
  );

  let possibleDays = 0;
  let publishedDays = 0;
  for (let d = ACTIVITY_WINDOW_DAYS - 1; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    const key = dateKey(day);
    // Seuls les jours d'ouverture comptent (un jour fermé n'est pas un jour « manqué »)
    if (day.getDay() < 1 || day.getDay() > 5 || key < signupKey || !isOpenOn(restaurant, day)) continue;
    possibleDays++;
    if (published.has(key)) publishedDays++;
  }

  const lastPublished = [...published].sort().pop() ?? null;
  const daysSinceLast = lastPublished
    ? Math.round((new Date(todayKey).getTime() - new Date(lastPublished).getTime()) / 86400000)
    : null;
  const rate = possibleDays ? publishedDays / possibleDays : 0;
  const ageDays = (now.getTime() - new Date(restaurant.certifiedAt).getTime()) / 86400000;

  const segment: Segment =
    ageDays < NEW_RESTAURANT_DAYS ? 'new' : rate >= 0.7 ? 'top' : rate >= 0.3 ? 'regular' : 'low';

  return { publishedDays, possibleDays, rate, lastPublished, daysSinceLast, segment };
};
