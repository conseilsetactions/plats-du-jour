import { Link } from '@tanstack/react-router';
import { ChevronRight, FileText } from 'lucide-react';
import ProPage from '@/components/pro/ProPage';
import { getInvoices } from '@/lib/billing';
import { useNow } from '@/lib/clock';
import { FREE_MONTHS } from '@/lib/plans';
import { formatPrice } from '@/utils/format';

const longDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Mes factures. En vrai : factures Stripe. Aucune pendant la période gratuite. */
export default function ProInvoices() {
  const now = useNow();

  return (
    <ProPage title="Mes factures" ownerOnly>
      {({ restaurant }) => {
        const billing = restaurant.billing!;
        const invoices = getInvoices(billing, restaurant.plan, now);

        return (
          <section className="px-4 py-5">
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center rounded-md border border-dashed border-border px-4 py-8 text-center">
                <FileText className="h-7 w-7 text-subtle" />
                <p className="mt-2 text-sm font-medium text-foreground">Aucune facture pour l'instant</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {billing.status === 'canceled'
                    ? 'Votre abonnement est résilié : aucune facture ne sera émise'
                    : `Aucune facture n'est émise pendant les ${FREE_MONTHS} mois offerts. Votre première facture sera envoyée le ${longDate(new Date(billing.trialEndsAt))}, après le premier prélèvement, puis chaque mois`}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border">
                {invoices.map((invoice) => (
                  <li key={invoice.id}>
                    <Link
                      to="/pro/factures/$invoiceId"
                      params={{ invoiceId: invoice.id }}
                      className="flex items-center gap-3 px-3 py-3 no-underline hover:bg-muted"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold capitalize text-foreground">
                          {invoice.chargeDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {invoice.id} · Payée le {invoice.chargeDate.toLocaleDateString('fr-FR')}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-bold text-foreground">
                          {formatPrice(invoice.amountTtc)}
                        </span>
                        <span className="block text-[11px] text-subtle">TTC</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-subtle" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[13px] text-muted-foreground">
              Chaque facture est aussi envoyée par e-mail à{' '}
              <span className="font-medium text-foreground">{billing.details.email}</span>.
            </p>
          </section>
        );
      }}
    </ProPage>
  );
}
