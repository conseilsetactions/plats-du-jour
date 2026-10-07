// Prélèvements et factures (SIMULÉS) : déduits de la date de fin de période gratuite.
// En vrai, les factures viendront de Stripe (une par prélèvement mensuel).
import type { Billing } from '@/lib/proStore';
import { PLANS, priceWithVat, VAT_RATE, type PlanId } from '@/lib/plans';

export interface Invoice {
  id: string; // ex. F-2027-04-001
  chargeDate: Date; // date du prélèvement (= date de la facture)
  periodEnd: Date; // fin de la période facturée (veille du prélèvement suivant)
  planName: string;
  amountHt: number;
  vat: number;
  amountTtc: number;
}

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

/**
 * Factures émises jusqu'à `now` : une par mois à partir de la fin de la période gratuite.
 * Après une résiliation, plus aucun prélèvement.
 * Simplification de la démo : le montant suit la formule actuelle.
 */
export const getInvoices = (billing: Billing, plan: PlanId, now: Date): Invoice[] => {
  const firstCharge = new Date(billing.trialEndsAt);
  const stopAt = billing.status === 'canceled' && billing.canceledAt ? new Date(billing.canceledAt) : now;
  const invoices: Invoice[] = [];

  for (let i = 0; i < 120; i++) {
    const chargeDate = addMonths(firstCharge, i);
    if (chargeDate > now || chargeDate > stopAt) break;
    const periodEnd = addMonths(chargeDate, 1);
    periodEnd.setDate(periodEnd.getDate() - 1);
    const amountHt = PLANS[plan].price;
    const amountTtc = priceWithVat(amountHt);
    invoices.push({
      id: `F-${chargeDate.getFullYear()}-${String(chargeDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
      chargeDate,
      periodEnd,
      planName: PLANS[plan].name,
      amountHt,
      vat: Math.round(amountHt * VAT_RATE * 100) / 100,
      amountTtc,
    });
  }
  return invoices.reverse(); // les plus récentes d'abord
};

/** Période gratuite en cours ? Sinon, date du prochain prélèvement. */
export const getBillingState = (billing: Billing, now: Date) => {
  const firstCharge = new Date(billing.trialEndsAt);
  if (now < firstCharge) return { inTrial: true as const, nextCharge: firstCharge };
  let nextCharge = firstCharge;
  while (nextCharge <= now) nextCharge = addMonths(nextCharge, 1);
  return { inTrial: false as const, nextCharge };
};

/**
 * Abonnement résilié : dernier jour où les plats sont visibles (la veille de l'échéance
 * qui n'aura pas lieu). Même règle que l'affichage côté clients (proStore.getTodayPlats).
 */
export const getLastVisibleDay = (billing: Billing) => {
  const end = getBillingState(billing, billing.canceledAt ? new Date(billing.canceledAt) : new Date()).nextCharge;
  const last = new Date(end);
  last.setDate(last.getDate() - 1);
  return last;
};
