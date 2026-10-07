// Outils de démonstration (visibles uniquement en développement) :
// simuler l'heure, tester des SIRET fictifs, remettre la démo à zéro.
import { useState } from 'react';
import { Clock3, FlaskConical, X } from 'lucide-react';
import { getDemoMonday, isDemoNow, setDemoNow, useNow } from '@/lib/clock';
import { DEMO_POSITIONS, getDemoGps, setDemoGps } from '@/lib/demoGps';
import { REMINDER_DAYS_BEFORE_CHARGE, trialEndDate } from '@/lib/plans';
import { proStore } from '@/lib/proStore';
import { TEST_SIRETS } from '@/lib/siret';
import { DEMO_SIRET_EVENT } from '@/components/pro/RestaurantForm';

const presets: { label: string; dayOffset: number; hour: number }[] = [
  { label: 'Lundi 10h', dayOffset: 0, hour: 10 },
  { label: 'Lundi 12h', dayOffset: 0, hour: 12 },
  { label: 'Mardi 15h', dayOffset: 1, hour: 15 },
  { label: 'Vendredi 12h', dayOffset: 4, hour: 12 },
  { label: 'Vendredi 15h', dayOffset: 4, hour: 15 },
  { label: 'Samedi 12h', dayOffset: 5, hour: 12 },
];

const DEMO_STORAGE_KEYS = [
  'pdj:pro-db',
  'pdj:pro-db-v2',
  'pdj:zone',
  'pdj:user-location',
  'pdj:user-preferences',
  'pdj:ab-variant',
  'pdj:ab-events',
  'pdj:ab-list-variant',
  'pdj:ab-list-events',
];

const chip = 'rounded border border-input px-2 py-1.5 text-foreground hover:border-accent';

/** Date réelle + 6 mois + 2 jours, à midi. */
const afterTrialDate = () => {
  const date = trialEndDate(new Date());
  date.setDate(date.getDate() + 2);
  date.setHours(12, 0, 0, 0);
  return date;
};

/** Jour d'envoi de l'e-mail « fin de période gratuite » d'un compte créé aujourd'hui (6 mois − 7 jours). */
const beforeFirstChargeDate = () => {
  const date = trialEndDate(new Date());
  date.setDate(date.getDate() - REMINDER_DAYS_BEFORE_CHARGE);
  date.setHours(12, 0, 0, 0);
  return date;
};

export default function DemoPanel() {
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const simulated = isDemoNow();
  const gps = getDemoGps();

  const label = now.toLocaleString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const applyTime = (dayOffset: number, hour: number) => {
    const date = getDemoMonday();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, 0, 0, 0);
    setDemoNow(date);
  };

  // Juste après la fin des 6 mois offerts d'un compte créé aujourd'hui : 1re facture émise
  const applyAfterTrial = () => setDemoNow(afterTrialDate());

  const useSiret = (siret: string) => {
    // Remplit le champ SIRET s'il est affiché, et copie le numéro dans tous les cas
    window.dispatchEvent(new CustomEvent(DEMO_SIRET_EVENT, { detail: siret }));
    navigator.clipboard?.writeText(siret).catch(() => {});
    setCopied(siret);
  };

  const resetDemo = () => {
    if (!window.confirm('Effacer tous les comptes, restaurants et plats de démo ?')) return;
    try {
      DEMO_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
      // stockage indisponible
    }
    setDemoNow(null);
    window.location.href = '/';
  };

  return (
    <div className="fixed bottom-3 left-3 z-[60] text-xs">
      {open ? (
        <div className="max-h-[80vh] w-64 overflow-y-auto rounded-lg border border-border bg-card p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold text-foreground">Outils de démo</span>
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-1.5 font-medium text-foreground">Heure</p>
          <p className="mb-2 text-muted-foreground">
            Maintenant : <span className="font-medium text-foreground">{label}</span>
            {simulated && ' (simulé)'}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((preset) => (
              <button key={preset.label} onClick={() => applyTime(preset.dayOffset, preset.hour)} className={chip}>
                {preset.label}
              </button>
            ))}
          </div>
          <button onClick={() => setDemoNow(beforeFirstChargeDate())} className={`${chip} mt-1.5 w-full`}>
            E-mail fin de gratuité ({beforeFirstChargeDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })})
          </button>
          <button onClick={applyAfterTrial} className={`${chip} mt-1.5 w-full`}>
            6 mois plus tard ({afterTrialDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })})
          </button>
          <button onClick={() => setDemoNow(null)} className={`${chip} mt-1.5 w-full`}>
            Heure réelle
          </button>

          <p className="mt-4 mb-1.5 font-medium text-foreground">Position GPS</p>
          <p className="mb-2 text-muted-foreground">
            Simule la position du téléphone et ouvre la liste des plats autour
            {gps && ' (position simulée active)'}
          </p>
          <div className="space-y-1.5">
            {DEMO_POSITIONS.map((position) => (
              <button
                key={position.label}
                onClick={() => setDemoGps(position.location)}
                className={`${chip} block w-full text-left`}
              >
                <span className="block font-medium">{position.label}</span>
                <span className="text-muted-foreground">{position.address}</span>
              </button>
            ))}
            <button onClick={() => setDemoGps(null)} className={`${chip} w-full`}>
              Vraie position du téléphone
            </button>
          </div>

          <p className="mt-4 mb-1.5 font-medium text-foreground">SIRET de test</p>
          <p className="mb-2 text-muted-foreground">
            À l'étape SIRET, touchez un établissement fictif pour le remplir et le vérifier
          </p>
          <div className="space-y-1.5">
            {TEST_SIRETS.map((test) => (
              <button key={test.siret} onClick={() => useSiret(test.siret)} className={`${chip} block w-full text-left`}>
                <span className="block font-medium">{test.name}</span>
                <span className="text-muted-foreground">
                  {test.siret}
                  {copied === test.siret && ' · copié'}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-4 mb-1.5 font-medium text-foreground">Admin</p>
          <button
            onClick={() => {
              proStore.seedDemoRestaurants();
              setSeeded(true);
            }}
            className={`${chip} w-full`}
          >
            Créer 6 établissements fictifs
            {seeded && ' · fait'}
          </button>
          <a
            href="/admin"
            className="mt-1.5 block w-full rounded border border-input px-2 py-1.5 text-center font-medium text-foreground no-underline hover:border-accent"
          >
            Ouvrir l'interface admin
          </a>
          <button
            onClick={resetDemo}
            className="mt-4 w-full rounded border border-accent px-2 py-1.5 font-medium text-accent-strong hover:bg-accent hover:text-accent-foreground"
          >
            Remettre la démo à zéro
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-md ${
            simulated ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card text-foreground'
          }`}
        >
          {simulated ? <Clock3 className="h-3.5 w-3.5" /> : <FlaskConical className="h-3.5 w-3.5" />}
          {simulated ? label : 'Démo'}
        </button>
      )}
    </div>
  );
}
