import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, CalendarX2, CircleCheck, CreditCard, FileText, RotateCcw } from 'lucide-react';
import ProPage from '@/components/pro/ProPage';
import { inputClass, primaryButton } from '@/components/pro/ui';
import { getBillingState } from '@/lib/billing';
import { useNow } from '@/lib/clock';
import { EMAILS } from '@/lib/email';
import { PLANS } from '@/lib/plans';
import { CANCEL_REASONS, proStore, type AdminNotification, type CancelReason } from '@/lib/proStore';

const longDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** E-mail « envoyé » (affiché en démo, aucun e-mail n'est réellement envoyé). */
function DemoEmail({ to, email, note }: { to: string; email: { subject: string; body: string }; note?: string }) {
  return (
    <div className="mt-6 rounded-md border border-dashed border-accent/60 p-3 text-[13px]">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Démo : e-mail envoyé à {to}</p>
      <p className="mt-1.5 font-semibold text-foreground">{email.subject}</p>
      <p className="mt-1 whitespace-pre-line rounded-md bg-muted p-2.5 text-foreground">{email.body}</p>
      <p className="mt-2 text-muted-foreground">
        Aucun e-mail n'est réellement envoyé{note ? `. ${note}` : ''}
      </p>
    </div>
  );
}

function StepTitle({ n, children }: { n: number; children: string }) {
  return (
    <h2 className="flex items-center gap-2.5 text-base font-semibold text-foreground">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-card">
        {n}
      </span>
      {children}
    </h2>
  );
}

/**
 * Résiliation, sur une page à part : pourquoi (raison facultative), comment ça se passe,
 * puis confirmation. Une alerte e-mail est envoyée à l'administrateur (SIMULÉ).
 */
export default function ProCancel() {
  const now = useNow();
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [comment, setComment] = useState('');
  // Résiliation confirmée sur cette page (affiche le récapitulatif et l'alerte admin de démo)
  const [done, setDone] = useState<AdminNotification | null | undefined>(undefined);

  return (
    <ProPage title="Résilier mon abonnement" ownerOnly>
      {({ restaurant }) => {
        const billing = restaurant.billing!;
        const canceled = billing.status === 'canceled';
        const state = getBillingState(billing, canceled && billing.canceledAt ? new Date(billing.canceledAt) : now);
        // Dernier jour où les plats sont visibles : la veille de l'échéance qui n'aura pas lieu
        const lastDay = new Date(state.nextCharge);
        lastDay.setDate(lastDay.getDate() - 1);
        const endDate = longDate(lastDay);
        const plan = restaurant.plan;

        const backLink = (
          <Link to="/pro/mon-abonnement" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent no-underline">
            <ArrowLeft className="h-4 w-4" />
            Mon abonnement
          </Link>
        );

        // Résiliation enregistrée (à l'instant, ou déjà auparavant)
        if (canceled) {
          return (
            <div className="px-4 py-5">
              {backLink}
              <div className="mt-6 text-center">
                <CircleCheck className="mx-auto h-12 w-12 text-accent" />
                <p className="mt-3 text-lg font-bold text-foreground">Votre résiliation est enregistrée</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucun prélèvement ne sera effectué. Jusqu'au{' '}
                  <span className="font-semibold text-foreground">{endDate}</span> inclus, vous pouvez continuer à
                  publier vos plats du jour : ils restent visibles par les clients
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Un e-mail de confirmation vous est envoyé à {billing.details.email}
                </p>
              </div>

              <button onClick={proStore.resumeSubscription} className={`${primaryButton} mt-6`}>
                <RotateCcw className="h-4 w-4" />
                J'ai changé d'avis, je garde mon abonnement
              </button>
              <Link to="/pro/espace" className="mt-3 block text-center text-sm font-semibold text-accent no-underline">
                Publier mes plats du jour
              </Link>

              {done && (
                <>
                  <DemoEmail
                    to={billing.details.email}
                    email={EMAILS.cancellationConfirmed(restaurant.name, lastDay)}
                  />
                  <DemoEmail to={done.to} email={done} note="L'alerte est aussi visible dans l'interface admin" />
                </>
              )}
            </div>
          );
        }

        return (
          <>
            <div className="px-4 pt-4">
              {backLink}
              <p className="mt-3 text-sm text-muted-foreground">
                Nous sommes désolés de vous voir partir. Trois étapes et c'est fait, sans frais ni justification
              </p>
            </div>

            {/* 1. Pourquoi */}
            <section className="border-b border-border px-4 py-5">
              <StepTitle n={1}>Pourquoi nous quittez-vous ?</StepTitle>
              <p className="ml-8 mt-0.5 text-xs text-subtle">Facultatif, mais votre réponse nous aide à progresser</p>
              <div className="mt-3 space-y-1.5">
                {(Object.keys(CANCEL_REASONS) as CancelReason[]).map((key) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm transition-colors ${
                      reason === key ? 'border-accent bg-accent-soft' : 'border-input hover:border-accent/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel-reason"
                      checked={reason === key}
                      onChange={() => setReason(key)}
                      className="h-4 w-4 accent-[#d97757]"
                    />
                    {CANCEL_REASONS[key]}
                  </label>
                ))}
              </div>

              {/* Une alternative selon la raison */}
              {reason === 'price' && plan !== 'plat' && (
                <p className="mt-3 rounded-md bg-muted p-3 text-[13px] text-foreground">
                  Saviez-vous que la formule {PLANS.plat.name} est à {PLANS.plat.price} € HT/mois ?{' '}
                  <Link to="/pro/mon-abonnement" className="font-semibold text-accent">
                    Changer de formule
                  </Link>
                </p>
              )}
              {reason === 'usability' && (
                <p className="mt-3 rounded-md bg-muted p-3 text-[13px] text-foreground">
                  Une difficulté ? Les réponses aux questions courantes sont dans{' '}
                  <Link to="/pro/faq" className="font-semibold text-accent">
                    l'aide
                  </Link>
                </p>
              )}

              {reason && (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder={reason === 'other' ? 'Dites-nous en plus…' : 'Un commentaire ? (facultatif)'}
                  aria-label="Commentaire sur la résiliation"
                  className={`${inputClass} mt-3 resize-none`}
                />
              )}
            </section>

            {/* 2. Comment ça se passe */}
            <section className="border-b border-border px-4 py-5">
              <StepTitle n={2}>Comment ça se passe</StepTitle>
              <ul className="mt-3 space-y-3">
                <li className="flex gap-3 text-sm">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    <span className="font-semibold text-foreground">Plus aucun prélèvement</span>
                    <span className="block text-[13px] text-muted-foreground">
                      {state.inTrial ? 'Vous ne paierez rien : votre période gratuite se termine simplement' : 'Le mois en cours, déjà payé, va jusqu’à son terme. Le suivant ne sera pas prélevé'}
                    </span>
                  </span>
                </li>
                <li className="flex gap-3 text-sm">
                  <CalendarX2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    <span className="font-semibold text-foreground">Vous pouvez publier et vos plats restent visibles jusqu'au {endDate} inclus</span>
                    <span className="block text-[13px] text-muted-foreground">
                      Ensuite, ils ne sont plus affichés aux clients ni relayés sur nos réseaux sociaux
                    </span>
                  </span>
                </li>
                <li className="flex gap-3 text-sm">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    <span className="font-semibold text-foreground">Votre compte est conservé</span>
                    <span className="block text-[13px] text-muted-foreground">
                      Vos factures restent accessibles et vous pouvez vous réabonner à tout moment
                    </span>
                  </span>
                </li>
              </ul>
            </section>

            {/* 3. Validation */}
            <section className="px-4 py-5">
              <StepTitle n={3}>Confirmez la résiliation</StepTitle>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setDone(proStore.cancelSubscription(reason ?? undefined, comment.trim()))}
                  className="w-full rounded-md border border-accent-strong px-4 py-2.5 text-sm font-semibold text-accent-strong hover:bg-accent-soft"
                >
                  Confirmer la résiliation
                </button>
                <Link to="/pro/mon-abonnement" className={`${primaryButton} no-underline`}>
                  Garder mon abonnement
                </Link>
              </div>
            </section>
          </>
        );
      }}
    </ProPage>
  );
}
