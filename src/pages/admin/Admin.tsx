import { useState, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Activity,
  Bell,
  ChevronDown,
  Eye,
  FlaskConical,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  Store,
  TrendingUp,
  UserMinus,
} from 'lucide-react';
import Header from '@/components/Header';
import { inputClass } from '@/components/pro/ui';
import ActivitySection from '@/pages/admin/ActivitySection';
import { getActivity, type Activity as ActivityData } from '@/lib/activity';
import { getAbEvents, resetAbTest, VARIANTS, type Variant } from '@/lib/abtest';
import { FUNNEL_STEPS, getFunnelEvents, resetFunnel } from '@/lib/funnel';
import { getListEvents, LIST_VARIANTS, resetListAbTest, type ListVariant } from '@/lib/listAbtest';
import { getBillingState } from '@/lib/billing';
import { useNow } from '@/lib/clock';
import { PLAN_IDS, PLANS } from '@/lib/plans';
import { CANCEL_REASONS, proStore, useProDb, type CancelReason, type Restaurant } from '@/lib/proStore';
import { dateKey, formatPhone, formatPrice } from '@/utils/format';

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');
const percent = (part: number, total: number) => (total ? `${Math.round((part / total) * 100)} %` : '–');

type Status = 'pending' | 'trial' | 'active' | 'canceled';
const STATUS_LABELS: Record<Status, string> = {
  pending: 'Carte non enregistrée',
  trial: 'Période gratuite',
  active: 'Payant',
  canceled: 'Résilié',
};

const statusOf = (restaurant: Restaurant, now: Date): Status => {
  const { billing } = restaurant;
  if (!billing) return 'pending';
  if (billing.status === 'canceled') return 'canceled';
  return getBillingState(billing, now).inTrial ? 'trial' : 'active';
};

interface Row {
  restaurant: Restaurant;
  status: Status;
  activity: ActivityData;
}

// --- Éléments communs -------------------------------------------------------

function Section({ icon: Icon, title, children, className = '' }: { icon: typeof Store; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`border-b border-border px-4 py-5 lg:rounded-lg lg:border lg:bg-card lg:p-5 ${className}`}>
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
        <Icon className="h-4 w-4 text-accent" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Kpi({ label, value, hint, alert = false }: { label: string; value: ReactNode; hint?: string; alert?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${alert ? 'text-accent-strong' : 'text-foreground'}`}>{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
        status === 'canceled'
          ? 'bg-muted text-muted-foreground'
          : status === 'pending'
            ? 'bg-muted text-accent-strong'
            : 'bg-accent-soft text-accent-strong'
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Ouvre l'espace pro de l'établissement « en tant que » son propriétaire. */
function ViewAsButton({ restaurant, compact = false }: { restaurant: Restaurant; compact?: boolean }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        proStore.impersonate(restaurant.id);
        navigate({ to: '/pro/espace' });
      }}
      className={`inline-flex items-center gap-1 rounded border border-input text-xs font-medium text-foreground hover:border-accent ${
        compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
      }`}
    >
      <Eye className="h-3.5 w-3.5" />
      Voir en tant que
    </button>
  );
}

function CallButton({ restaurant }: { restaurant: Restaurant }) {
  return (
    <a
      href={`tel:${restaurant.ownerPhone}`}
      className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground no-underline hover:bg-accent-strong"
    >
      <Phone className="h-3.5 w-3.5" />
      Appeler le {formatPhone(restaurant.ownerPhone)}
    </a>
  );
}

/** Coordonnées : portable (appel), e-mail du compte, adresse. */
function Contact({ restaurant }: { restaurant: Restaurant }) {
  const email = restaurant.billing?.details.email;
  return (
    <div className="space-y-1 text-xs">
      <a href={`tel:${restaurant.ownerPhone}`} className="flex items-center gap-1.5 text-foreground no-underline hover:text-accent">
        <Phone className="h-3 w-3 text-subtle" />
        {formatPhone(restaurant.ownerPhone)}
      </a>
      {email && (
        <a href={`mailto:${email}`} className="flex items-center gap-1.5 break-all text-foreground no-underline hover:text-accent">
          <Mail className="h-3 w-3 shrink-0 text-subtle" />
          {email}
        </a>
      )}
      <p className="flex items-center gap-1.5 text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0 text-subtle" />
        {restaurant.street}, {restaurant.postalCode} {restaurant.city}
      </p>
    </div>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nom, quartier, téléphone…"
        aria-label="Rechercher un établissement"
        className={`${inputClass} h-9 py-1.5 pl-8`}
      />
    </div>
  );
}

const matches = (restaurant: Restaurant, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digits = q.replace(/\D/g, '');
  return (
    restaurant.name.toLowerCase().includes(q) ||
    restaurant.quartier.toLowerCase().includes(q) ||
    (digits.length >= 2 && formatPhone(restaurant.ownerPhone).replace(/\D/g, '').includes(digits))
  );
};

// --- Page -------------------------------------------------------------------

/**
 * Interface admin (DÉMO : lit les données de ce navigateur).
 * Ordinateur : tout. Téléphone : chiffres clés, établissements à relancer, liste avec coordonnées.
 * En vrai : données du serveur, page protégée par une connexion administrateur.
 */
export default function Admin() {
  const db = useProDb();
  const now = useNow();
  const [query, setQuery] = useState('');

  const rows: Row[] = Object.values(db.restaurants)
    .sort((a, b) => b.certifiedAt.localeCompare(a.certifiedAt))
    .map((restaurant) => ({
      restaurant,
      status: statusOf(restaurant, now),
      activity: getActivity(db, restaurant, now),
    }));

  const count = (s: Status) => rows.filter((row) => row.status === s).length;
  const live = rows.filter((row) => row.status === 'trial' || row.status === 'active');
  const toCall = live.filter((row) => row.activity.segment === 'low');
  const mrr = live.reduce((sum, row) => sum + PLANS[row.restaurant.plan].price, 0);
  const todayPlats = new Set(db.plats.filter((p) => p.date === dateKey(now)).map((p) => p.restaurantId)).size;
  const filtered = rows.filter((row) => matches(row.restaurant, query));

  const kpis = {
    total: <Kpi label="Établissements" value={rows.length} hint={`${count('pending')} inscription(s) inachevée(s)`} />,
    toCall: <Kpi label="À relancer" value={toCall.length} hint="Moins de 30 % des jours publiés" alert={toCall.length > 0} />,
    mrr: <Kpi label="Revenu mensuel prévu" value={formatPrice(mrr)} hint="HT, hors résiliés" />,
    today: <Kpi label="Ont publié aujourd'hui" value={todayPlats} hint={`sur ${live.length} actif(s)`} />,
    trial: <Kpi label="Période gratuite" value={count('trial')} />,
    active: <Kpi label="Payants" value={count('active')} />,
    canceled: <Kpi label="Résiliés" value={count('canceled')} hint={`${percent(count('canceled'), rows.length)} des inscrits`} />,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Admin" wide />

      <main className="mx-auto w-full max-w-md flex-1 bg-card pb-10 lg:max-w-6xl lg:bg-transparent lg:px-6">
        <div className="px-4 pt-5 lg:px-0">
          <h1 className="text-xl font-bold text-foreground lg:text-2xl">Tableau de bord</h1>
          <p className="mt-2 rounded-md border border-dashed border-accent/60 p-2.5 text-[13px] text-muted-foreground lg:bg-card">
            <span className="font-semibold text-accent-strong">Démo :</span> données de ce navigateur
            uniquement. Pour la vraie version, cette page lira le serveur et sera protégée par une connexion
            administrateur
          </p>
        </div>

        {/* ------------------------------ TÉLÉPHONE ------------------------------ */}
        <div className="lg:hidden">
          <section className="grid grid-cols-2 gap-2 border-b border-border px-4 py-5">
            {kpis.total}
            {kpis.toCall}
            {kpis.mrr}
            {kpis.today}
          </section>

          <Section icon={Phone} title={`À relancer (${toCall.length})`}>
            {toCall.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Personne à relancer pour l'instant</p>
            ) : (
              <ul className="space-y-2">
                {toCall.map(({ restaurant, activity }) => (
                  <li key={restaurant.id} className="rounded-md border border-border p-3 text-[13px]">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-semibold text-foreground">{restaurant.name}</span>
                      <span className="shrink-0 text-xs font-semibold">
                        {activity.publishedDays}/{activity.possibleDays} j
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {activity.lastPublished
                        ? `Dernière publication : il y a ${activity.daysSinceLast} jour(s)`
                        : 'Aucune publication'}{' '}
                      · {restaurant.quartier}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <CallButton restaurant={restaurant} />
                      <ViewAsButton restaurant={restaurant} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section icon={Store} title={`Établissements (${rows.length})`}>
            <SearchBox value={query} onChange={setQuery} />
            <ul className="mt-3 space-y-2">
              {filtered.map(({ restaurant, status }) => (
                <li key={restaurant.id}>
                  <details className="group rounded-md border border-border">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-foreground">{restaurant.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {restaurant.quartier} · {PLANS[restaurant.plan].name}
                        </span>
                      </span>
                      <StatusBadge status={status} />
                      <ChevronDown className="h-4 w-4 shrink-0 text-subtle transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="space-y-2 border-t border-border px-3 py-2.5">
                      <Contact restaurant={restaurant} />
                      <ViewAsButton restaurant={restaurant} />
                    </div>
                  </details>
                </li>
              ))}
              {filtered.length === 0 && <li className="text-[13px] text-muted-foreground">Aucun résultat</li>}
            </ul>
          </Section>

          <p className="px-4 pt-4 text-center text-xs text-subtle">
            Suivi détaillé, A/B test, alertes et résiliations : sur ordinateur
          </p>
        </div>

        {/* ------------------------------ ORDINATEUR ----------------------------- */}
        <div className="hidden space-y-6 pt-6 lg:block">
          <div className="grid grid-cols-7 gap-3">
            {kpis.total}
            {kpis.toCall}
            {kpis.today}
            {kpis.trial}
            {kpis.active}
            {kpis.canceled}
            {kpis.mrr}
          </div>

          <div className="grid grid-cols-3 items-start gap-6">
            <Section icon={Activity} title="Suivi des publications" className="col-span-2">
              <ActivitySection db={db} now={now} />
            </Section>
            <div className="space-y-6">
              <PlansBreakdown rows={live} />
              <FunnelSection />
              <AbTestSection />
              <ListAbTestSection />
              <AlertsSection />
              <CancellationsSection rows={rows} />
            </div>
          </div>

          <Section icon={Store} title={`Établissements (${rows.length})`}>
            <div className="mb-3 max-w-sm">
              <SearchBox value={query} onChange={setQuery} />
            </div>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-[13px]">
                <thead className="bg-muted text-left text-xs text-subtle">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Établissement</th>
                    <th className="px-3 py-2 font-semibold">Formule</th>
                    <th className="px-3 py-2 font-semibold">Statut</th>
                    <th className="px-3 py-2 font-semibold">Régularité (4 sem.)</th>
                    <th className="px-3 py-2 font-semibold">Coordonnées</th>
                    <th className="px-3 py-2 font-semibold">Inscrit le</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ restaurant, status, activity }) => (
                    <tr key={restaurant.id} className="border-t border-border align-top">
                      <td className="px-3 py-2.5">
                        <span className="block font-semibold text-foreground">{restaurant.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {restaurant.quartier} · SIRET {restaurant.siret}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">{PLANS[restaurant.plan].name}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-3 py-2.5">
                        {status === 'pending' || status === 'canceled' ? (
                          <span className="text-xs text-subtle">–</span>
                        ) : (
                          <>
                            <span className="text-xs font-semibold">
                              {activity.publishedDays}/{activity.possibleDays} j
                            </span>
                            <span className="mt-1 block h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                              <span className="block h-full rounded-full bg-accent" style={{ width: `${activity.rate * 100}%` }} />
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Contact restaurant={restaurant} />
                      </td>
                      <td className="px-3 py-2.5 text-xs">{shortDate(restaurant.certifiedAt)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <ViewAsButton restaurant={restaurant} compact />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-muted-foreground">
                        Aucun établissement
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

// --- Blocs de la version ordinateur -----------------------------------------

function PlansBreakdown({ rows }: { rows: Row[] }) {
  return (
    <Section icon={TrendingUp} title="Répartition par formule">
      <div className="space-y-1.5">
        {PLAN_IDS.map((id) => {
          const n = rows.filter((row) => row.restaurant.plan === id).length;
          return (
            <div key={id} className="flex items-center gap-2 text-xs">
              <span className="w-24 shrink-0 text-muted-foreground">{PLANS[id].name}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-accent" style={{ width: rows.length ? `${(n / rows.length) * 100}%` : 0 }} />
              </span>
              <span className="w-6 text-right font-semibold text-foreground">{n}</span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/** Tunnel d'inscription : nombre de visiteurs à chaque étape et pertes (cible : < 15 % d'abandon au paiement). */
function FunnelSection() {
  const [events, setEvents] = useState(getFunnelEvents);
  const counts = FUNNEL_STEPS.map(({ id, label }) => ({ id, label, n: events.filter((e) => e.step === id).length }));
  const start = counts[0].n;
  const paymentStart = counts.find((c) => c.id === 'paiement_intro')!.n;
  const done = counts.find((c) => c.id === 'termine')!.n;
  const paymentDropOff = paymentStart ? Math.round(((paymentStart - done) / paymentStart) * 100) : null;

  return (
    <Section icon={FlaskConical} title="Tunnel d'inscription pro">
      <table className="w-full text-xs">
        <thead className="text-left text-subtle">
          <tr>
            <th className="pb-1.5 font-semibold">Étape</th>
            <th className="pb-1.5 text-right font-semibold">Visiteurs</th>
            <th className="pb-1.5 text-right font-semibold">Du départ</th>
            <th className="pb-1.5 text-right font-semibold">Perte</th>
          </tr>
        </thead>
        <tbody>
          {counts.map(({ id, label, n }, i) => {
            const previous = i > 0 ? counts[i - 1].n : n;
            const loss = previous ? Math.round(((previous - n) / previous) * 100) : 0;
            return (
              <tr key={id} className="border-t border-border">
                <td className="py-1.5 pr-2 font-medium text-foreground">{label}</td>
                <td className="py-1.5 text-right">{n}</td>
                <td className="py-1.5 text-right">{percent(n, start)}</td>
                <td className={`py-1.5 text-right ${loss >= 30 ? 'font-semibold text-accent-strong' : ''}`}>
                  {i > 0 && previous ? (loss > 0 ? `−${loss} %` : '0 %') : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-[12px] text-foreground">
        Abandon au paiement :{' '}
        <span className={`font-semibold ${paymentDropOff !== null && paymentDropOff >= 15 ? 'text-accent-strong' : 'text-open'}`}>
          {paymentDropOff === null ? '—' : `${paymentDropOff} %`}
        </span>{' '}
        <span className="text-muted-foreground">(objectif : moins de 15 %)</span>
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Chaque étape est comptée une fois par visite. En démo, seules les visites de ce navigateur sont comptées
      </p>
      <button
        onClick={() => {
          if (!window.confirm('Remettre à zéro les mesures du tunnel ?')) return;
          resetFunnel();
          setEvents([]);
        }}
        className="mt-3 inline-flex items-center gap-1 rounded border border-input px-2.5 py-1.5 text-xs text-foreground hover:border-accent"
      >
        <RotateCcw className="h-3 w-3" />
        Remettre à zéro
      </button>
    </Section>
  );
}

function ListAbTestSection() {
  const [events, setEvents] = useState(getListEvents);
  const stats = (['a', 'c'] as ListVariant[]).map((variant) => {
    const of = (type: string) => events.filter((e) => e.variant === variant && e.type === type).length;
    return { variant, views: of('view'), clicks: of('plat_click') };
  });

  return (
    <Section icon={FlaskConical} title="A/B test de la liste des plats (ordinateur)">
      <table className="w-full text-xs">
        <thead className="text-left text-subtle">
          <tr>
            <th className="pb-1.5 font-semibold">Version</th>
            <th className="pb-1.5 text-right font-semibold">Vues</th>
            <th className="pb-1.5 text-right font-semibold">Plats ouverts</th>
            <th className="pb-1.5 text-right font-semibold">Taux</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(({ variant, views, clicks }) => (
            <tr key={variant} className="border-t border-border">
              <td className="py-1.5 pr-2 font-medium text-foreground">{LIST_VARIANTS[variant]}</td>
              <td className="py-1.5 text-right">{views}</td>
              <td className="py-1.5 text-right">{clicks}</td>
              <td className="py-1.5 text-right font-semibold text-accent-strong">{percent(clicks, views)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Seuls les visiteurs sur ordinateur avec le GPS activé participent (sans GPS, le plan est toujours affiché).
        Taux = plats ouverts ÷ vues
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <a href="/?liste=a" className="rounded border border-input px-2.5 py-1.5 text-foreground no-underline hover:border-accent">
          Version A
        </a>
        <a href="/?liste=c" className="rounded border border-input px-2.5 py-1.5 text-foreground no-underline hover:border-accent">
          Version C
        </a>
        <button
          onClick={() => {
            if (!window.confirm("Remettre à zéro les mesures de l'A/B test de la liste ?")) return;
            resetListAbTest();
            setEvents([]);
          }}
          className="inline-flex items-center gap-1 rounded border border-input px-2.5 py-1.5 text-foreground hover:border-accent"
        >
          <RotateCcw className="h-3 w-3" />
          Remettre à zéro
        </button>
      </div>
    </Section>
  );
}

function AbTestSection() {
  const [events, setEvents] = useState(getAbEvents);
  const stats = (['a', 'b'] as Variant[]).map((variant) => {
    const of = (type: string) => events.filter((e) => e.variant === variant && e.type === type).length;
    return { variant, views: of('view'), clicks: of('signup_click'), signups: of('signup_complete') };
  });

  return (
    <Section icon={FlaskConical} title="A/B test de la landing pro">
      <table className="w-full text-xs">
        <thead className="text-left text-subtle">
          <tr>
            <th className="pb-1.5 font-semibold">Version</th>
            <th className="pb-1.5 text-right font-semibold">Vues</th>
            <th className="pb-1.5 text-right font-semibold">Clics</th>
            <th className="pb-1.5 text-right font-semibold">Inscrits</th>
            <th className="pb-1.5 text-right font-semibold">Conv.</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(({ variant, views, clicks, signups }) => (
            <tr key={variant} className="border-t border-border">
              <td className="py-1.5 pr-2 font-medium text-foreground">{VARIANTS[variant]}</td>
              <td className="py-1.5 text-right">{views}</td>
              <td className="py-1.5 text-right">{clicks}</td>
              <td className="py-1.5 text-right">{signups}</td>
              <td className="py-1.5 text-right font-semibold text-accent-strong">{percent(signups, views)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Conv. = inscriptions terminées ÷ vues. Il faut plusieurs centaines de vues par version avant de conclure
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <a href="/pro?version=a" className="rounded border border-input px-2.5 py-1.5 text-foreground no-underline hover:border-accent">
          Version A
        </a>
        <a href="/pro?version=b" className="rounded border border-input px-2.5 py-1.5 text-foreground no-underline hover:border-accent">
          Version B
        </a>
        <button
          onClick={() => {
            if (!window.confirm("Remettre à zéro les mesures de l'A/B test ?")) return;
            resetAbTest();
            setEvents([]);
          }}
          className="inline-flex items-center gap-1 rounded border border-input px-2.5 py-1.5 text-foreground hover:border-accent"
        >
          <RotateCcw className="h-3 w-3" />
          Remettre à zéro
        </button>
      </div>
    </Section>
  );
}

function AlertsSection() {
  const db = useProDb();
  const alerts = db.adminNotifications ?? [];
  return (
    <Section icon={Bell} title="Alertes reçues">
      {alerts.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Aucune alerte pour l'instant</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {alerts.map((n) => (
            <li key={n.id}>
              <details className="group px-3 py-2.5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-2 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{n.subject}</span>
                    <span className="text-[11px] text-subtle">{new Date(n.at).toLocaleString('fr-FR')}</span>
                  </span>
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-subtle transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 whitespace-pre-line rounded-md bg-muted p-2.5 text-[13px] text-foreground">{n.body}</p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function CancellationsSection({ rows }: { rows: Row[] }) {
  const canceled = rows.filter((row) => row.status === 'canceled').map((row) => row.restaurant);
  const reasons = [
    ...(Object.keys(CANCEL_REASONS) as CancelReason[]).map((key) => ({
      label: CANCEL_REASONS[key],
      n: canceled.filter((r) => r.billing?.cancelReason === key).length,
    })),
    { label: 'Non précisée', n: canceled.filter((r) => !r.billing?.cancelReason).length },
  ];

  return (
    <Section icon={UserMinus} title={`Résiliations (${canceled.length})`}>
      {canceled.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Aucune résiliation</p>
      ) : (
        <>
          <div className="space-y-1.5">
            {reasons.map(({ label, n }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-accent-strong" style={{ width: `${(n / canceled.length) * 100}%` }} />
                </span>
                <span className="w-6 text-right font-semibold text-foreground">{n}</span>
              </div>
            ))}
          </div>
          <ul className="mt-3 space-y-2">
            {canceled.map((r) => (
              <li key={r.id} className="rounded-md border border-border p-2.5 text-[13px]">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-foreground">{r.name}</span>
                  <span className="text-xs text-subtle">{shortDate(r.billing!.canceledAt!)}</span>
                </div>
                <p className="text-muted-foreground">
                  {r.billing!.cancelReason ? CANCEL_REASONS[r.billing!.cancelReason] : 'Raison non précisée'}
                </p>
                {r.billing!.cancelComment && <p className="mt-1 italic text-foreground">« {r.billing!.cancelComment} »</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}
