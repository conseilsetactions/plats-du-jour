// Formules d'abonnement restaurateur (gratuites les 6 premiers mois)
export type PlanId = 'plat' | 'menu' | 'ia';

export const FREE_MONTHS = 6;
export const VAT_RATE = 0.2;
/** Le SMS de rappel part ce nombre de jours avant le premier prélèvement. */
export const REMINDER_DAYS_BEFORE_CHARGE = 7;

export const priceWithVat = (priceHt: number) => Math.round(priceHt * (1 + VAT_RATE) * 100) / 100;

/** Date du premier prélèvement : dans 6 mois. */
export const trialEndDate = (from: Date) => {
  const end = new Date(from);
  end.setMonth(end.getMonth() + FREE_MONTHS);
  return end;
};

export const PLAN_IDS: PlanId[] = ['plat', 'menu', 'ia'];

export const PLANS: Record<PlanId, { name: string; price: number; tagline: string; features: string[] }> = {
  plat: {
    name: 'Plat du jour',
    price: 5,
    tagline: 'Publiez votre plat du jour en 30 secondes',
    features: ['1 plat par jour', 'Saisie de la semaine en une fois'],
  },
  menu: {
    name: 'Menu',
    price: 7,
    tagline: 'Publiez vos suggestions du jour',
    features: ['Entrée, plat, dessert, formule'],
  },
  ia: {
    name: 'Menu + IA',
    price: 9,
    tagline: 'Prenez votre ardoise en photo, l’IA remplit tout',
    features: ['Menu rempli grâce à l’IA', 'Modifiable avant publication'],
  },
};

/** Les formules Menu et Menu + IA permettent plusieurs lignes par jour. */
export const isMenuPlan = (plan: PlanId) => plan !== 'plat';

export const MENU_CATEGORIES = ['Entrée', 'Plat', 'Dessert', 'Formule'] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];
