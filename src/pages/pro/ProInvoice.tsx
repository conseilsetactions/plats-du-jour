import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeft, Download } from 'lucide-react';
import ProPage from '@/components/pro/ProPage';
import { secondaryButton } from '@/components/pro/ui';
import { getInvoices } from '@/lib/billing';
import { useNow } from '@/lib/clock';

const longDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

// Informations légales de l'éditeur : À COMPLÉTER avant la mise en ligne
const ISSUER = {
  name: 'Plats du Jour — C&A Conseils et Actions',
  address: '[Adresse à compléter]',
  siret: '[SIRET à compléter]',
  vat: '[N° de TVA intracommunautaire à compléter]',
};

const euros = (n: number) => n.toFixed(2).replace('.', ',') + ' €';

/** Une facture, au format imprimable (« Télécharger en PDF » = impression en PDF). */
export default function ProInvoice() {
  const { invoiceId } = useParams({ from: '/pro/factures/$invoiceId' });
  const now = useNow();

  return (
    <ProPage title="Facture" ownerOnly>
      {({ restaurant }) => {
        const billing = restaurant.billing!;
        const invoice = getInvoices(billing, restaurant.plan, now).find((i) => i.id === invoiceId);

        if (!invoice) {
          return (
            <section className="px-4 py-5 text-sm text-muted-foreground">
              Facture introuvable.{' '}
              <Link to="/pro/factures" className="font-medium text-accent">
                Retour à mes factures
              </Link>
            </section>
          );
        }

        const { details } = billing;

        return (
          <section className="px-4 py-5">
            <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
              <Link to="/pro/factures" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent no-underline">
                <ArrowLeft className="h-4 w-4" />
                Mes factures
              </Link>
              <button onClick={() => window.print()} className={secondaryButton}>
                <Download className="h-4 w-4" />
                Télécharger en PDF
              </button>
            </div>

            {/* La facture */}
            <article className="rounded-md border border-border bg-card p-4 text-[13px] leading-relaxed text-foreground shadow-sm print:border-0 print:shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-accent">FACTURE</p>
                  <p className="font-semibold">N° {invoice.id}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>Date : {invoice.chargeDate.toLocaleDateString('fr-FR')}</p>
                  <p className="font-semibold text-accent-strong">Payée</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="mb-1 font-semibold uppercase tracking-wide text-subtle">Émetteur</p>
                  <p className="font-medium text-foreground">{ISSUER.name}</p>
                  <p className="text-muted-foreground">{ISSUER.address}</p>
                  <p className="text-muted-foreground">SIRET {ISSUER.siret}</p>
                  <p className="text-muted-foreground">TVA {ISSUER.vat}</p>
                </div>
                <div>
                  <p className="mb-1 font-semibold uppercase tracking-wide text-subtle">Client</p>
                  <p className="font-medium text-foreground">{details.name}</p>
                  <p className="text-muted-foreground">{details.street}</p>
                  <p className="text-muted-foreground">
                    {details.postalCode} {details.city}
                  </p>
                  <p className="text-muted-foreground">SIRET {restaurant.siret}</p>
                </div>
              </div>

              <table className="mt-5 w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-subtle">
                    <th className="pb-1.5 font-semibold">Désignation</th>
                    <th className="pb-1.5 text-right font-semibold">Montant HT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-3">
                      Abonnement Plats du Jour — formule {invoice.planName}
                      <span className="block text-muted-foreground">
                        Période du {longDate(invoice.chargeDate)} au {longDate(invoice.periodEnd)}
                      </span>
                    </td>
                    <td className="py-2 text-right align-top">{euros(invoice.amountHt)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-3 ml-auto w-48 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total HT</span>
                  <span>{euros(invoice.amountHt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA 20 %</span>
                  <span>{euros(invoice.vat)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 text-sm font-bold">
                  <span>Total TTC</span>
                  <span>{euros(invoice.amountTtc)}</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Payée le {longDate(invoice.chargeDate)} par carte bancaire (prélèvement via Stripe)
              </p>
              <p className="mt-3 border-t border-border pt-3 text-[10px] leading-snug text-subtle">
                [Mentions légales obligatoires à faire valider : pénalités de retard, indemnité forfaitaire
                pour frais de recouvrement, conditions d'escompte.]
              </p>
            </article>

            <p className="mt-3 text-xs text-subtle print:hidden">
              Envoyée par e-mail à {details.email}.
            </p>
          </section>
        );
      }}
    </ProPage>
  );
}
