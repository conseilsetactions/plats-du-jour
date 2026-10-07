// Horloge de l'app + règles horaires du service.
// En mode démo (lib/demo.ts), l'heure peut être simulée depuis le module « Démo » pour tester tous les cas.
import { useEffect, useState } from 'react';
import { DEMO_MODE } from '@/lib/demo';

export const SERVICE_START_HOUR = 11;
export const SERVICE_END_HOUR = 14;

const OVERRIDE_KEY = 'pdj:demo-now';
const listeners = new Set<() => void>();

export const getNow = (): Date => {
  if (DEMO_MODE) {
    try {
      const override = sessionStorage.getItem(OVERRIDE_KEY);
      if (override) return new Date(override);
    } catch {
      // stockage indisponible : heure réelle
    }
  }
  return new Date();
};

export const setDemoNow = (date: Date | null) => {
  try {
    if (date) sessionStorage.setItem(OVERRIDE_KEY, date.toISOString());
    else sessionStorage.removeItem(OVERRIDE_KEY);
  } catch {
    // stockage indisponible
  }
  listeners.forEach((listener) => listener());
};

export const isDemoNow = () => {
  try {
    return !!sessionStorage.getItem(OVERRIDE_KEY);
  } catch {
    return false;
  }
};

/** Heure courante, rafraîchie chaque minute et à chaque changement d'heure simulée. */
export const useNow = (): Date => {
  const [now, setNow] = useState(getNow);
  useEffect(() => {
    const update = () => setNow(getNow());
    const timer = setInterval(update, 30_000);
    listeners.add(update);
    return () => {
      clearInterval(timer);
      listeners.delete(update);
    };
  }, []);
  return now;
};

const isWeekday = (date: Date) => date.getDay() >= 1 && date.getDay() <= 5;

/**
 * - open    : jour ouvré entre 11h et 14h, les plats sont visibles
 * - before  : jour ouvré avant 11h
 * - after   : lundi à jeudi après 14h
 * - weekend : vendredi après 14h, samedi, dimanche
 */
export type ServiceStatus = 'open' | 'before' | 'after' | 'weekend';

export const getServiceStatus = (now: Date): ServiceStatus => {
  if (!isWeekday(now)) return 'weekend';
  const hour = now.getHours();
  if (hour < SERVICE_START_HOUR) return 'before';
  if (hour < SERVICE_END_HOUR) return 'open';
  return now.getDay() === 5 ? 'weekend' : 'after';
};

/**
 * Jours pour lesquels un restaurateur peut publier :
 * d'aujourd'hui à vendredi en semaine (aujourd'hui seulement avant 14h),
 * ou du lundi au vendredi suivants à partir du vendredi 14h et le week-end.
 */
export const getPublishableDays = (now: Date): Date[] => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Après la fin du service, on ne publie plus pour aujourd'hui
  if (now.getHours() >= SERVICE_END_HOUR) start.setDate(start.getDate() + 1);
  const day = start.getDay();
  if (day === 6) start.setDate(start.getDate() + 2);
  if (day === 0) start.setDate(start.getDate() + 1);

  const days: Date[] = [];
  for (const d = new Date(start); d.getDay() >= 1 && d.getDay() <= 5; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
};

/** Lundi de la semaine utile (semaine en cours, ou suivante le week-end) — pour la démo. */
export const getDemoMonday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const offset = day === 6 ? 2 : day === 0 ? 1 : 1 - day; // samedi/dimanche -> lundi suivant
  d.setDate(d.getDate() + offset);
  return d;
};
