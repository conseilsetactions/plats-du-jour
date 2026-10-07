import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, KeyRound, LoaderCircle, MessageSquareText, Smartphone } from 'lucide-react';
import Header from '@/components/Header';
import { narrowMain } from '@/components/layout';
import PasswordForm, { PASSWORD_HINT, PASSWORD_LENGTH, PASSWORD_REGEX, pinInputClass } from '@/components/pro/PasswordForm';
import PlanCards from '@/components/pro/PlanCards';
import SignupSteps, { type SignupStep } from '@/components/pro/SignupSteps';
import { errorClass, inputClass, labelClass, primaryButton } from '@/components/pro/ui';
import { FREE_MONTHS, type PlanId } from '@/lib/plans';
import { LOCK_MINUTES, proStore, useProDb } from '@/lib/proStore';
import { SMS } from '@/lib/sms';
import type { LegalDocId } from '@/pages/legal/legalContent';
import { formatPhone } from '@/utils/format';

const PHONE_REGEX = /^(\+33\s?|0)[67]([\s.]?\d{2}){4}$/;
const PHONE_ERROR = 'Numéro de portable invalide (ex. 06 12 34 56 78)';

const phoneSchema = z.object({ phone: z.string().trim().regex(PHONE_REGEX, PHONE_ERROR) });
const loginSchema = z.object({
  phone: z.string().trim().regex(PHONE_REGEX, PHONE_ERROR),
  password: z.string().regex(PASSWORD_REGEX, `Votre mot de passe contient ${PASSWORD_HINT}`),
});
const codeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Le code contient 6 chiffres'),
});

const benefits = [
  'Visible par les clients autour de vous',
  'Aucune commission sur vos ventes',
  'Formule modifiable à tout moment',
];

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

function LegalLink({ doc, children }: { doc: LegalDocId; children: ReactNode }) {
  return (
    <Link to="/legal/$doc" params={{ doc }} target="_blank" className="font-medium text-accent underline">
      {children}
    </Link>
  );
}

/** En-tête d'un écran : pictogramme, titre et explication. */
function ScreenTitle({ icon: Icon, title, children }: { icon: typeof KeyRound; title: string; children?: ReactNode }) {
  return (
    <div className="text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
      {children && <p className="mt-2 text-sm text-muted-foreground">{children}</p>}
    </div>
  );
}

type Mode = 'login' | 'signup' | 'reset';
/** Étape après l'envoi du SMS (inscription ou mot de passe oublié). */
type Pending = { phone: string; code: string; text: string; verified: boolean };

/**
 * Connexion : portable + mot de passe à 4 chiffres.
 * Inscription, une étape par écran : formule → portable (+ conditions, code SMS) → mot de passe,
 * puis établissement (/pro/espace) et paiement (/pro/abonnement).
 * Mot de passe oublié : code par SMS, puis nouveau mot de passe.
 */
export default function ProLogin() {
  const db = useProDb();
  const navigate = useNavigate();
  const search = useSearch({ from: '/pro/connexion' });
  const [mode, setMode] = useState<Mode>(search.mode ?? 'login');
  // Inscription : la formule a son propre écran, puis le portable
  const [planChosen, setPlanChosen] = useState(false);
  const [plan, setPlan] = useState<PlanId>(search.plan ?? 'plat');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  // Envoi de SMS simulé : on garde le code « envoyé » en mémoire pour la démo
  const [pending, setPending] = useState<Pending | null>(null);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({ resolver: zodResolver(phoneSchema) });
  const loginForm = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const codeForm = useForm<z.infer<typeof codeSchema>>({ resolver: zodResolver(codeSchema) });

  // Chaque nouvel écran s'affiche en haut
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode, planChosen, !!pending, pending?.verified]);

  // Déjà connecté avec un espace actif : accès direct. Une inscription inachevée ne compte pas.
  // Première connexion après l'inscription : on passe d'abord par « Bien démarrer ».
  if (proStore.hasActiveSpace(db)) {
    return <Navigate to={proStore.shouldShowGettingStarted() ? '/pro/bien-demarrer' : '/pro/espace'} />;
  }

  const goToSpace = () =>
    navigate({ to: proStore.shouldShowGettingStarted() ? '/pro/bien-demarrer' : '/pro/espace' });

  const switchMode = (next: Mode) => {
    setMode(next);
    setPending(null);
    setPlanChosen(false);
    phoneForm.clearErrors();
    loginForm.clearErrors();
  };

  // --- Connexion ---
  const login = async ({ phone, password }: z.infer<typeof loginSchema>) => {
    if (!proStore.hasAccount(phone)) {
      loginForm.setError('phone', { message: 'Aucun compte avec ce numéro. Choisissez « Créer mon compte »' });
      return;
    }
    if (!proStore.hasPassword(phone)) {
      loginForm.setError('password', {
        message: "Ce compte n'a pas encore de mot de passe : utilisez « Mot de passe oublié »",
      });
      return;
    }
    const result = await proStore.checkPassword(phone, password);
    if (result === 'locked') {
      loginForm.setError('password', {
        message: `Trop d'essais. Réessayez dans ${LOCK_MINUTES} minutes ou utilisez « Mot de passe oublié »`,
      });
      return;
    }
    if (result === 'wrong') {
      loginForm.setError('password', { message: 'Numéro ou mot de passe incorrect' });
      return;
    }
    proStore.signIn(phone);
    goToSpace();
  };

  // --- Inscription et mot de passe oublié : envoi du code par SMS ---
  const sendCode = ({ phone }: { phone: string }) => {
    const exists = proStore.hasAccount(phone);
    if (mode === 'reset' && !exists) {
      phoneForm.setError('phone', { message: 'Aucun compte avec ce numéro' });
      return;
    }
    if (mode === 'signup' && exists) {
      phoneForm.setError('phone', { message: 'Ce numéro a déjà un compte. Choisissez « Se connecter »' });
      return;
    }
    if (mode === 'signup' && !termsAccepted) {
      setTermsError(true);
      return;
    }
    const code = generateCode();
    setPending({
      phone,
      code,
      text: mode === 'signup' ? SMS.signupCode(code) : SMS.resetCode(code),
      verified: false,
    });
    codeForm.reset({ code: '' });
  };

  const verifyCode = ({ code }: { code: string }) => {
    if (!pending || code !== pending.code) {
      codeForm.setError('code', { message: 'Code incorrect' });
      return;
    }
    setPending({ ...pending, verified: true });
  };

  // Portable vérifié : création du compte (inscription) ou nouveau mot de passe
  const choosePassword = async (password: string) => {
    if (!pending) return;
    proStore.signIn(pending.phone, mode === 'signup' ? { plan } : undefined);
    await proStore.setPassword(pending.phone, password);
    // Inscription : on enchaîne sur l'étape « Établissement »
    if (mode === 'signup') navigate({ to: '/pro/espace' });
    else goToSpace();
  };

  // Étape affichée dans la barre de progression (inscription uniquement)
  const step: SignupStep = !planChosen ? 'Formule' : pending?.verified ? 'Mot de passe' : 'Portable';
  const back = pending ? () => setPending(null) : planChosen ? () => setPlanChosen(false) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Espace pro" />

      <main className={narrowMain}>
        {mode === 'signup' && <SignupSteps current={step} onBack={back} />}

        {pending?.verified ? (
          /* Choix du mot de passe */
          <div className="px-4 py-8">
            <ScreenTitle
              icon={KeyRound}
              title={mode === 'signup' ? 'Choisissez votre mot de passe' : 'Choisissez un nouveau mot de passe'}
            >
              {PASSWORD_LENGTH} chiffres, faciles à retenir. Vous vous connecterez avec le{' '}
              {formatPhone(pending.phone)} et ce mot de passe
            </ScreenTitle>
            <div className="mt-6">
              <PasswordForm
                submitLabel={mode === 'signup' ? 'Suivant' : 'Enregistrer et me connecter'}
                onSubmit={choosePassword}
              />
            </div>
          </div>
        ) : pending ? (
          /* Saisie du code reçu par SMS */
          <div className="px-4 py-8">
            <ScreenTitle icon={MessageSquareText} title="Saisissez le code reçu">
              Envoyé par SMS au <span className="font-medium text-foreground">{formatPhone(pending.phone)}</span>
            </ScreenTitle>

            <form onSubmit={codeForm.handleSubmit(verifyCode)} noValidate className="mt-6 space-y-3">
              <div>
                <label htmlFor="pro-code" className="sr-only">
                  Code à 6 chiffres
                </label>
                <input
                  id="pro-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="______"
                  aria-invalid={!!codeForm.formState.errors.code}
                  className={`${inputClass} text-center text-xl tracking-[0.5em]`}
                  {...codeForm.register('code')}
                />
                {codeForm.formState.errors.code && (
                  <p className={`${errorClass} text-center`}>{codeForm.formState.errors.code.message}</p>
                )}
              </div>
              <button type="submit" className={primaryButton}>
                Suivant
              </button>
            </form>

            <div className="mt-6 rounded-md border border-dashed border-accent/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Démo</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Aucun SMS n'est réellement envoyé pour l'instant. Voici celui qui partirait :
              </p>
              <p className="mt-1.5 rounded-md bg-muted p-2.5 text-[13px] text-foreground">{pending.text}</p>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                Votre code :{' '}
                <span className="font-semibold tracking-widest text-foreground">{pending.code}</span>
              </p>
            </div>

            <div className="mt-4 flex justify-center gap-6 text-sm font-medium text-accent">
              <button onClick={() => sendCode({ phone: pending.phone })}>Renvoyer un code</button>
              <button onClick={() => setPending(null)}>Changer de numéro</button>
            </div>
          </div>
        ) : mode === 'signup' && !planChosen ? (
          /* Inscription, étape 1 : la formule */
          <div className="px-4 py-6">
            <h1 className="text-xl font-bold text-foreground">Choisissez votre formule</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Commencer, c'est gratuit : {FREE_MONTHS} mois offerts sur toutes les formules
            </p>

            <div className="mt-4">
              <PlanCards selected={plan} onSelect={setPlan} />
            </div>

            <ul className="mt-4 space-y-1.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                  {benefit}
                </li>
              ))}
            </ul>

            <button onClick={() => setPlanChosen(true)} className={`${primaryButton} mt-6`}>
              Suivant
            </button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Déjà inscrit ?{' '}
              <button onClick={() => switchMode('login')} className="font-semibold text-accent">
                Se connecter
              </button>
            </p>
          </div>
        ) : mode === 'login' ? (
          /* Connexion */
          <div className="px-4 py-6">
            <h1 className="text-xl font-bold text-foreground">Accédez à votre espace</h1>
            <form
              onSubmit={loginForm.handleSubmit(login)}
              noValidate
              className="mt-6 space-y-3 rounded-md border border-border bg-muted p-4"
            >
              <div>
                <label htmlFor="pro-phone" className={labelClass}>
                  Votre numéro de portable
                </label>
                <input
                  id="pro-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="06 12 34 56 78"
                  aria-invalid={!!loginForm.formState.errors.phone}
                  className={inputClass}
                  {...loginForm.register('phone')}
                />
                {loginForm.formState.errors.phone && (
                  <p className={errorClass}>{loginForm.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="pro-password" className={labelClass}>
                  Mot de passe ({PASSWORD_HINT})
                </label>
                <input
                  id="pro-password"
                  type="password"
                  inputMode="numeric"
                  maxLength={PASSWORD_LENGTH}
                  placeholder="••••"
                  autoComplete="current-password"
                  aria-invalid={!!loginForm.formState.errors.password}
                  className={pinInputClass}
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className={errorClass}>{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <button type="submit" disabled={loginForm.formState.isSubmitting} className={primaryButton}>
                {loginForm.formState.isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="w-full text-center text-sm font-medium text-accent"
              >
                Mot de passe oublié ?
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <button onClick={() => switchMode('signup')} className="font-semibold text-accent">
                Créer mon compte
              </button>
            </p>
          </div>
        ) : (
          /* Inscription, étape 2 (portable + conditions) ou mot de passe oublié */
          <div className="px-4 py-6">
            {mode === 'signup' ? (
              <ScreenTitle icon={Smartphone} title="Votre numéro de portable">
                Il vous servira à vous connecter. Nous vous envoyons un code par SMS pour le vérifier
              </ScreenTitle>
            ) : (
              <>
                <h1 className="text-xl font-bold text-foreground">Mot de passe oublié</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Saisissez le portable de votre compte : vous recevrez un code par SMS pour choisir un
                  nouveau mot de passe
                </p>
              </>
            )}

            <form
              onSubmit={phoneForm.handleSubmit(sendCode)}
              noValidate
              className="mt-6 space-y-4 rounded-md border border-border bg-muted p-4"
            >
              <div>
                <label htmlFor="pro-phone" className={labelClass}>
                  Votre numéro de portable
                </label>
                <input
                  id="pro-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="06 12 34 56 78"
                  aria-invalid={!!phoneForm.formState.errors.phone}
                  className={inputClass}
                  {...phoneForm.register('phone')}
                />
                {phoneForm.formState.errors.phone && (
                  <p className={errorClass}>{phoneForm.formState.errors.phone.message}</p>
                )}
              </div>
              {mode === 'signup' && (
                <div>
                  <label className="flex items-start gap-2.5 text-[13px] leading-snug text-foreground">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        setTermsError(false);
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#d97757]"
                    />
                    <span>
                      J'accepte les <LegalLink doc="cgv">conditions générales de vente</LegalLink> et la{' '}
                      <LegalLink doc="confidentialite">politique de confidentialité</LegalLink>
                    </span>
                  </label>
                  {termsError && (
                    <p role="alert" className={errorClass}>
                      Vous devez accepter les conditions pour créer un compte
                    </p>
                  )}
                </div>
              )}
              <button type="submit" className={primaryButton}>
                {mode === 'signup' ? 'Suivant' : 'Recevoir un code par SMS'}
              </button>
              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full text-center text-sm font-medium text-accent"
                >
                  Retour à la connexion
                </button>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
