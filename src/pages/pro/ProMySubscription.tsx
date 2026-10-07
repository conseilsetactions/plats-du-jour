import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, CreditCard, Pencil } from 'lucide-react';
import BillingDetailsFields, { billingSchema, type BillingValues } from '@/components/pro/BillingDetailsFields';
import ProPage from '@/components/pro/ProPage';
import { primaryButton, secondaryButton } from '@/components/pro/ui';
import { getBillingState, getLastVisibleDay } from '@/lib/billing';
import { useNow } from '@/lib/clock';
import { EMAILS } from '@/lib/email';
import { PLAN_IDS, PLANS, priceWithVat, REMINDER_DAYS_BEFORE_CHARGE } from '@/lib/plans';
import { proStore, useProDb } from '@/lib/proStore';
import { formatPrice } from '@/utils/format';

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

function Block({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-border px-4 py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Mon abonnement : formule, carte, facturation, résiliation. Paiement SIMULÉ en démo. */
export default function ProMySubscription() {
  const { restaurant } = proStore.getContext(useProDb());
  const now = useNow();
  const [editingBilling, setEditingBilling] = useState(false);
  const [cardNotice, setCardNotice] = useState(false);
  const billingForm = useForm<BillingValues>({
    resolver: zodResolver(billingSchema),
    values: restaurant?.billing?.details,
  });

  return (
    <ProPage title="Mon abonnement" ownerOnly>
      {({ restaurant }) => {
        const billing = restaurant.billing!;
        const plan = PLANS[restaurant.plan];
        const canceled = billing.status === 'canceled';
        // Résilié : on se place à la date de résiliation pour connaître la fin de la période en cours
        const state = getBillingState(billing, canceled && billing.canceledAt ? new Date(billing.canceledAt) : now);
        // Résilié : visible jusqu'à la fin de la période déjà payée (ou gratuite)
        const endDate = longDate(state.nextCharge.toISOString());
        // Date d'envoi de l'e-mail « fin de période gratuite »
        const reminderDate = new Date(billing.trialEndsAt);
        reminderDate.setDate(reminderDate.getDate() - REMINDER_DAYS_BEFORE_CHARGE);
        reminderDate.setHours(9, 0, 0, 0); // envoi le matin du jour J − 7
        const status = canceled
          ? `Abonnement résilié : vous pouvez publier et vos plats restent visibles jusqu'au ${longDate(getLastVisibleDay(billing).toISOString())} inclus. Aucun prélèvement ne sera effectué`
          : state.inTrial
            ? `Gratuit jusqu'au ${endDate}, puis ${formatPrice(plan.price)} HT/mois`
            : `Abonnement actif. Prochain prélèvement le ${endDate} : ${formatPrice(priceWithVat(plan.price))} TTC`;

        return (
          <>
            {/* Formule et statut */}
            <Block title="Ma formule">
              <div className="rounded-md bg-accent-soft p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                  <span className="text-sm font-bold text-foreground">{formatPrice(plan.price)} HT/mois</span>
                </div>
                <p className="text-right text-xs text-muted-foreground">
                  soit {formatPrice(priceWithVat(plan.price))} TTC/mois
                </p>
                <p className={`mt-2 text-[13px] font-medium ${canceled ? 'text-foreground' : 'text-accent-strong'}`}>
                  {status}
                </p>
              </div>

              {/* E-mail de fin de période gratuite, 7 jours avant le 1er prélèvement (SIMULÉ) */}
              {!canceled && state.inTrial && now >= reminderDate && (() => {
                const email = EMAILS.trialEnding(
                  restaurant.name,
                  plan.name,
                  plan.price,
                  priceWithVat(plan.price),
                  state.nextCharge,
                  REMINDER_DAYS_BEFORE_CHARGE
                );
                return (
                  <div className="mt-4 rounded-md border border-dashed border-accent/60 p-3 text-[13px]">
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
                      Démo : e-mail envoyé le {longDate(reminderDate.toISOString())} à {billing.details.email}
                    </p>
                    <p className="mt-1.5 font-semibold text-foreground">{email.subject}</p>
                    <p className="mt-1 whitespace-pre-line rounded-md bg-muted p-2.5 text-foreground">{email.body}</p>
                  </div>
                );
              })()}

              {!canceled && (
                <>
                  <p className="mb-2 mt-4 text-[13px] font-medium text-foreground">Changer de formule</p>
                  <div role="radiogroup" aria-label="Changer de formule" className="grid grid-cols-3 gap-2">
                    {PLAN_IDS.map((id) => {
                      const active = restaurant.plan === id;
                      return (
                        <button
                          key={id}
                          role="radio"
                          aria-checked={active}
                          onClick={() => proStore.setPlan(id)}
                          className={`rounded-md border bg-card px-2.5 py-2 text-left transition-colors ${
                            active ? 'border-accent ring-1 ring-accent' : 'border-input hover:border-accent/50'
                          }`}
                        >
                          <span className={`block text-[13px] font-semibold ${active ? 'text-accent' : 'text-foreground'}`}>
                            {PLANS[id].name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{PLANS[id].price} € HT/mois</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-subtle">Le changement de formule est immédiat</p>
                </>
              )}
            </Block>

            {/* Moyen de paiement */}
            <Block title="Moyen de paiement">
              <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <CreditCard className="h-4 w-4 text-accent" />
                  Carte bancaire enregistrée
                </span>
                <button onClick={() => setCardNotice(true)} className="text-xs font-medium text-accent">
                  Modifier ma carte
                </button>
              </div>
              {cardNotice && (
                <p className="mt-2 rounded-md border border-dashed border-accent/60 p-2.5 text-[13px] text-muted-foreground">
                  <span className="font-semibold text-accent-strong">Démo :</span> ce bouton ouvrira la page
                  sécurisée de Stripe pour changer de carte
                </p>
              )}
            </Block>

            {/* Informations de facturation */}
            <Block
              title="Facturation"
              action={
                !editingBilling && (
                  <button
                    onClick={() => setEditingBilling(true)}
                    aria-label="Modifier les informations de facturation"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-input text-muted-foreground hover:border-accent/50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )
              }
            >
              {editingBilling ? (
                <form
                  noValidate
                  onSubmit={billingForm.handleSubmit((details) => {
                    proStore.updateBillingDetails(details);
                    setEditingBilling(false);
                  })}
                >
                  <BillingDetailsFields form={billingForm} />
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => setEditingBilling(false)} className={`${secondaryButton} flex-1`}>
                      Annuler
                    </button>
                    <button type="submit" className={`${primaryButton} flex-1`}>
                      Enregistrer
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-foreground">
                  <p className="font-medium">{billing.details.name}</p>
                  <p className="text-muted-foreground">
                    {billing.details.street}, {billing.details.postalCode} {billing.details.city}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Factures envoyées à <span className="text-foreground">{billing.details.email}</span>
                  </p>
                  <p className="mt-1 text-xs text-subtle">SIRET {restaurant.siret}</p>
                  <Link
                    to="/pro/factures"
                    className="mt-3 inline-flex items-center gap-0.5 text-sm font-semibold text-accent no-underline"
                  >
                    Voir mes factures
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </Block>

            {/* Résiliation */}
            <section className="px-4 py-6">
              {canceled ? (
                <button onClick={proStore.resumeSubscription} className={primaryButton}>
                  Réactiver mon abonnement
                </button>
              ) : (
                // La résiliation se fait sur une page à part : pourquoi, comment, confirmation
                <Link
                  to="/pro/resiliation"
                  className="block w-full text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-accent-strong"
                >
                  Résilier mon abonnement
                </Link>
              )}
            </section>
          </>
        );
      }}
    </ProPage>
  );
}
