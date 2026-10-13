// Formules d'abonnement restaurateur (gratuites les 6 premiers mois)
export type PlanId = 'plat' | 'menu';

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

export const PLAN_IDS: PlanId[] = ['plat', 'menu'];

/**
 * Deux formules pour l'instant (la formule « Menu + IA » est retirée).
 * L'identifiant technique de la Formule reste « menu » (données déjà enregistrées).
 */
export const PLANS: Record<PlanId, { name: string; price: number; tagline: string; features: string[] }> = {
  plat: {
    name: 'Plat du jour',
    price: 5,
    tagline: 'Une seule ligne à saisir : votre plat du jour',
    features: ['1 plat par jour', 'Saisie de la semaine en une fois'],
  },
  menu: {
    name: 'Formule',
    price: 7,
    tagline: 'Votre ardoise : tous vos plats du jour',
    features: ['Plusieurs plats par jour', 'Plats uniquement (pas d’entrées ni de desserts)'],
  },
};

/** La Formule permet plusieurs plats par jour (l'ardoise). */
export const isMenuPlan = (plan: PlanId) => plan === 'menu';

/** Anciennes catégories de ligne (avant la Formule « plats uniquement ») : conservées pour les données existantes. */
export type MenuCategory = 'Entrée' | 'Plat' | 'Dessert' | 'Formule';
