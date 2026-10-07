import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import BillingDetailsFields, { billingSchema, type BillingValues } from '@/components/pro/BillingDetailsFields';
import {
  BellRing,
  CalendarCheck,
  ChevronDown,
  CircleX,
  CreditCard,
  Gift,
  Handshake,
  LoaderCircle,
  Lock,
  Sprout,
} from 'lucide-react';
import Header from '@/components/Header';
import SignupSteps from '@/components/pro/SignupSteps';
import { trackAb } from '@/lib/abtest';
import { trackFunnel } from '@/lib/funnel';
import { useNow } from '@/lib/clock';
import {
  FREE_MONTHS,
  PLANS,
  priceWithVat,
  REMINDER_DAYS_BEFORE_CHARGE,
  trialEndDate,
} from '@/lib/plans';
import { proStore, useProDb } from '@/lib/proStore';
import { formatPrice } from '@/utils/format';
import { pageMain } from '@/components/layout';

const longDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Dernière étape de l'inscription : enregistrement de la carte (Stripe) avant la période gratuite.
 * DÉMO : Stripe n'est pas encore branché, l'enregistrement de la carte est simulé.
 */
export default function ProSubscription() {
  const db = useProDb();
  const now = useNow();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const { restaurant, role } = proStore.getContext(db);
  // Écran « Comprendre les 6 mois gratuits » d'abord, puis le formulaire de carte
  const [introSeen, setIntroSeen] = useState(false);
  const owner = !!restaurant && role === 'owner' && !restaurant.billing;

  // Mesure du tunnel : écran d'explication, puis formulaire de paiement
  useEffect(() => {
    if (owner) trackFunnel(introSeen ? 'paiement' : 'paiement_intro');
  }, [owner, introSeen]);
  // Adresse de facturation pré-remplie depuis l'établissement (SIRET)
  const billingForm = useForm<BillingValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      name: restaurant?.name.replace(/\s*\(test\)$/, '') ?? '',
      street: restaurant?.street ?? '',
      postalCode: restaurant?.postalCode ?? '',
      city: restaurant?.city ?? '',
      email: '',
    },
  });

  if (!db.session) return <Navigate to="/pro/connexion" search={{ mode: 'login' }} />;
  // Pas d'établissement, membre d'équipe ou carte déjà enregistrée : rien à faire ici
  if (!restaurant || role !== 'owner' || restaurant.billing) return <Navigate to="/pro/espace" />;

  const plan = PLANS[restaurant.plan];
  const chargeDate = trialEndDate(now);
  const reminderDate = new Date(chargeDate);
  reminderDate.setDate(reminderDate.getDate() - REMINDER_DAYS_BEFORE_CHARGE);

  const guarantees = [
    { icon: Gift, title: `Rien à payer pendant ${FREE_MONTHS} mois`, text: `Votre premier prélèvement aura lieu le ${longDate(chargeDate)}` },
    { icon: BellRing, title: 'Un e-mail vous prévient avant', text: `Vous recevez un rappel ${REMINDER_DAYS_BEFORE_CHARGE} jours avant le premier prélèvement` },
    { icon: CircleX, title: 'Annulable à tout moment', text: 'Depuis votre espace, sans frais ni justification' },
    { icon: Lock, title: 'Paiement sécurisé par Stripe', text: 'Votre carte est saisie chez Stripe : nous ne voyons jamais son numéro' },
  ];

  const timeline = [
    { date: "Aujourd'hui", label: '0 €', strong: true },
    { date: longDate(reminderDate), label: 'E-mail de rappel', strong: false },
    {
      date: longDate(chargeDate),
      label: `1er prélèvement : ${formatPrice(priceWithVat(plan.price))} TTC (soit ${formatPrice(plan.price)} HT)`,
      strong: false,
    },
  ];

  // Démo : simule l'aller-retour vers la page de paiement Stripe
  const saveCard = (details: BillingValues) => {
    setRedirecting(true);
    setTimeout(() => {
      proStore.startTrial(chargeDate, details);
      trackFunnel('termine');
      trackAb('signup_complete'); // conversion attribuée à la version de landing vue
      navigate({ to: '/pro/espace' }); // « Bien démarrer » s'affichera à la prochaine connexion
    }, 1200);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Espace pro" />

      <main className={`${pageMain} pb-10`}>
        <SignupSteps current="Activation (0 €)" onBack={introSeen ? () => setIntroSeen(false) : undefined} />
        {!introSeen ? (
          <PaymentIntro chargeDate={longDate(chargeDate)} onContinue={() => setIntroSeen(true)} />
        ) : (
          <>
            {/* Hero */}
            <section className="bg-accent-soft px-5 pb-7 pt-7 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Dernière étape</p>
              <h1 className="mt-2 text-[34px] font-bold leading-none text-foreground">0 € aujourd'hui</h1>
              <p className="mt-3 text-[15px] text-muted-foreground">
                Votre formule <span className="font-semibold text-foreground">{plan.name}</span> est gratuite
                pendant {FREE_MONTHS} mois
              </p>

              <div className="mt-5 rounded-lg border border-border bg-card p-4 text-left shadow-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">Formule {plan.name}</span>
                  <span className="text-sm font-bold text-foreground">{formatPrice(plan.price)} HT/mois</span>
                </div>
                <p className="mt-0.5 text-right text-xs text-muted-foreground">
                  soit {formatPrice(priceWithVat(plan.price))} TTC/mois
                </p>
                <div className="mt-3 flex items-center justify-between rounded-md bg-accent-soft px-3 py-2 text-sm">
                  <span className="text-foreground">À payer aujourd'hui</span>
                  <span className="font-bold text-accent-strong">0 €</span>
                </div>
              </div>
            </section>

            {/* Garanties */}
            <section className="px-5 py-6">
              <ul className="space-y-4">
                {guarantees.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{title}</span>
                      <span className="text-[13px] text-muted-foreground">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Frise */}
            <section className="border-t border-border px-5 py-6">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Comment ça se passe</h2>
              <ol className="relative ml-1.5 space-y-4 border-l-2 border-accent-soft pl-5">
                {timeline.map(({ date, label, strong }) => (
                  <li key={date} className="relative">
                    <span
                      className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-card ${strong ? 'bg-accent' : 'bg-accent/40'}`}
                    />
                    <span className="block text-xs text-subtle">{date}</span>
                    <span className={`text-sm ${strong ? 'font-bold text-accent-strong' : 'font-medium text-foreground'}`}>
                      {label}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Facturation + action */}
            <form onSubmit={billingForm.handleSubmit(saveCard)} noValidate className="border-t border-border px-5 pt-6">
              <h2 className="text-sm font-semibold text-foreground">Informations de facturation</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Aucune facture n'est émise pendant les {FREE_MONTHS} mois offerts. Ensuite, une facture vous est
                envoyée par e-mail chaque mois, après le prélèvement, tant que l'abonnement continue
              </p>

              <div className="mt-4">
                <BillingDetailsFields form={billingForm} />
                <p className="mt-3 text-xs text-subtle">SIRET {restaurant.siret}</p>
              </div>

              <button
                type="submit"
                disabled={redirecting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-[15px] font-semibold text-accent-foreground shadow-md transition-colors hover:bg-accent-strong disabled:opacity-70"
              >
                {redirecting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                {redirecting ? 'Connexion à Stripe…' : 'Enregistrer ma carte bancaire'}
              </button>
              <p className="mt-2 flex items-center justify-center gap-1 text-xs text-subtle">
                <Lock className="h-3 w-3" />
                Vous serez redirigé vers la page sécurisée de Stripe
              </p>

              <details className="group mt-5 rounded-md border border-border px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  Pourquoi me demande-t-on ma carte bancaire ?
                  <ChevronDown className="h-4 w-4 shrink-0 text-subtle transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  Pour que votre abonnement continue sans interruption après les {FREE_MONTHS} mois offerts.
                  Rien n'est prélevé pendant cette période, et un e-mail vous prévient{' '}
                  {REMINDER_DAYS_BEFORE_CHARGE} jours avant le premier prélèvement. Vous pouvez annuler à tout
                  moment depuis votre espace, sans frais
                </p>
              </details>

              <div className="mt-5 rounded-md border border-dashed border-accent/60 p-3 text-[13px] text-muted-foreground">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Démo</p>
                Stripe n'est pas encore branché : le bouton simule l'enregistrement d'une carte. Aucune carte
                n'est demandée ni débitée
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

/**
 * Avant la carte : pourquoi 6 mois gratuits, quand viennent les résultats, ce qui se passe ensuite.
 * Ton direct et honnête : on répond aux questions avant qu'elles se posent.
 */
function PaymentIntro({ chargeDate, onContinue }: { chargeDate: string; onContinue: () => void }) {
  const points = [
    {
      icon: Sprout,
      title: 'Pourquoi 6 mois gratuits ?',
      text: 'Vos clients ne changent pas leurs habitudes du jour au lendemain. Il leur faut le temps de vous découvrir',
    },
    {
      icon: CalendarCheck,
      title: 'Quand voir les résultats ?',
      text: 'Comptez en général environ 3 mois en publiant régulièrement. Les 3 mois suivants, vous jugez sur pièce',
    },
    {
      icon: CreditCard,
      title: 'Pourquoi votre carte maintenant ?',
      text: `Pour que tout continue sans coupure si vous restez. Rien n'est prélevé avant le ${chargeDate}`,
    },
    {
      icon: Handshake,
      title: 'Et après 6 mois ?',
      text: `Vous décidez. Un e-mail vous prévient ${REMINDER_DAYS_BEFORE_CHARGE} jours avant. Vous pouvez arrêter à tout moment, sans frais ni justification`,
    },
  ];

  return (
    <>
      <section className="bg-accent-soft px-5 pb-7 pt-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Avant de continuer</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-foreground">Comprendre les {FREE_MONTHS} mois gratuits</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          On teste ensemble pendant {FREE_MONTHS} mois. Pas de frais, pas d'engagement, pas de surprise
        </p>
      </section>

      <ul className="space-y-5 px-5 py-6">
        {points.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">{title}</span>
              <span className="text-[13px] leading-relaxed text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="px-5">
        <p className="mb-4 text-center text-[15px] font-semibold text-foreground">Alors, on lance ensemble ?</p>
        <button
          onClick={onContinue}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-[15px] font-semibold text-accent-foreground shadow-md transition-colors hover:bg-accent-strong"
        >
          Continuer vers le paiement
        </button>
        <p className="mt-2 text-center text-xs text-subtle">0 € aujourd'hui · sans engagement</p>
      </div>
    </>
  );
}
