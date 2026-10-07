import { useState } from 'react';
import { Mail, MessageSquareText, Phone, Send } from 'lucide-react';
import {
  FOLLOW_UP,
  getActivity,
  nextOccurrence,
  SEGMENTS,
  type Activity,
  type Segment,
} from '@/lib/activity';
import { EMAILS } from '@/lib/email';
import { isFirstOpenDayOfWeek, isOpenOn } from '@/lib/openDays';
import { proStore, type AdminAction, type ProDbSnapshot, type Restaurant } from '@/lib/proStore';
import { SMS } from '@/lib/sms';
import { dateKey, formatPhone } from '@/utils/format';

const ACTION_LABELS: Record<AdminAction['type'], string> = {
  sms_weekly: 'SMS de rappel de la semaine',
  email_congrats: 'E-mail de félicitations',
};

interface Row {
  restaurant: Restaurant;
  activity: Activity;
  publishedToday: boolean;
  openToday: boolean;
  /** Aujourd'hui = 1er jour d'ouverture de la semaine (jour du SMS de rappel). */
  reminderDay: boolean;
}

const longDate = (date: Date) =>
  date.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

function AutoMessage({
  icon: Icon,
  title,
  next,
  recipients,
  note,
  preview,
  onSimulate,
}: {
  icon: typeof Mail;
  title: string;
  next: Date;
  recipients: number;
  note?: string;
  preview: string;
  onSimulate: () => void;
}) {
  const [sent, setSent] = useState<number | null>(null);
  return (
    <div className="mt-3 rounded-md border border-border bg-muted p-3 text-[13px]">
      <p className="flex items-center gap-1.5 font-semibold text-foreground">
        <Icon className="h-4 w-4 text-accent" />
        {title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Prochain envoi : {longDate(next)}. {note}
        {' '}Destinataires aujourd'hui : {recipients}.
      </p>
      <p className="mt-2 whitespace-pre-line rounded-md bg-card p-2.5 text-foreground">{preview}</p>
      <button
        onClick={() => {
          onSimulate();
          setSent(recipients);
        }}
        disabled={recipients === 0}
        className="mt-2 inline-flex items-center gap-1 rounded border border-dashed border-accent/60 px-2.5 py-1.5 text-xs font-medium text-accent-strong hover:bg-accent-soft disabled:opacity-50"
      >
        <Send className="h-3 w-3" />
        Démo : simuler l'envoi maintenant
      </button>
      {sent !== null && (
        <p className="mt-1.5 text-xs text-accent-strong">
          {sent} envoi(s) enregistré(s) dans l'historique (démo : rien n'est envoyé)
        </p>
      )}
    </div>
  );
}

/**
 * Suivi des publications sur 4 semaines :
 * - tous : SMS de rappel UNE fois par semaine, le 1er jour d'ouverture à 10h30, si le plat du jour n'est pas publié
 *   (ton selon la catégorie) ;
 * - meilleurs publiants : e-mail de félicitations le vendredi à 15h ;
 * - à relancer : un appel, numéro affiché.
 * Envois SIMULÉS : en vrai, tâches planifiées côté serveur.
 */
export default function ActivitySection({ db, now }: { db: ProDbSnapshot; now: Date }) {
  const [segment, setSegment] = useState<Segment>('low');
  const today = dateKey(now);

  // Établissements actifs uniquement (carte enregistrée, non résiliés)
  const rows: Row[] = Object.values(db.restaurants)
    .filter((r) => r.billing && r.billing.status !== 'canceled')
    .map((restaurant) => ({
      restaurant,
      activity: getActivity(db, restaurant, now),
      publishedToday: db.plats.some((p) => p.restaurantId === restaurant.id && p.date === today),
      openToday: isOpenOn(restaurant, now),
      reminderDay: isFirstOpenDayOfWeek(restaurant, now),
    }))
    .sort((a, b) => b.activity.rate - a.activity.rate);

  const inSegment = rows.filter((row) => row.activity.segment === segment);
  // Destinataires du SMS de la semaine : c'est leur 1er jour d'ouverture et le plat n'est pas encore publié
  const notPublished = inSegment.filter((row) => row.reminderDay && !row.publishedToday);
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const historyOf = (id: string) => (db.adminActions ?? []).filter((a) => a.restaurantId === id);

  const sample = inSegment[0];
  const congrats = sample
    ? EMAILS.weeklyCongrats(sample.restaurant.name, sample.activity.publishedDays, sample.activity.possibleDays)
    : null;

  return (
    <div>
      {/* Segments */}
      <div className="grid grid-cols-4 gap-1.5">
        {(Object.keys(SEGMENTS) as Segment[]).map((key) => {
          const n = rows.filter((row) => row.activity.segment === key).length;
          const active = segment === key;
          return (
            <button
              key={key}
              onClick={() => setSegment(key)}
              className={`rounded-md border px-1.5 py-2 text-center transition-colors ${
                active ? 'border-accent bg-accent-soft' : 'border-input hover:border-accent/50'
              }`}
            >
              <span className={`block text-lg font-bold ${key === 'low' && n ? 'text-accent-strong' : 'text-foreground'}`}>{n}</span>
              <span className="block text-[10px] leading-tight text-muted-foreground">{SEGMENTS[key].label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {SEGMENTS[segment].hint}, sur les 4 dernières semaines
      </p>

      {/* SMS hebdomadaire (toutes catégories), ton adapté */}
      <AutoMessage
        key={`sms-${segment}`}
        icon={MessageSquareText}
        title={`SMS de rappel · ${FOLLOW_UP.weeklySms.label}`}
        next={nextOccurrence(now, FOLLOW_UP.weeklySms.hour, FOLLOW_UP.weeklySms.minute)}
        note="Un seul SMS par semaine et par établissement, seulement si le plat du jour n'est pas encore publié"
        recipients={isWeekday ? notPublished.length : 0}
        preview={SMS.weeklyReminder(segment)}
        onSimulate={() => proStore.logFollowUp(notPublished.map((row) => row.restaurant.id), 'sms_weekly')}
      />

      {/* E-mail du vendredi (meilleurs publiants) */}
      {segment === 'top' && congrats && (
        <AutoMessage
          icon={Mail}
          title={`E-mail de félicitations · ${FOLLOW_UP.congratsEmail.label}`}
          next={nextOccurrence(now, FOLLOW_UP.congratsEmail.hour, FOLLOW_UP.congratsEmail.minute, FOLLOW_UP.congratsEmail.weekday)}
          recipients={inSegment.length}
          preview={`${congrats.subject}\n\n${congrats.body}`}
          onSimulate={() => proStore.logFollowUp(inSegment.map((row) => row.restaurant.id), 'email_congrats')}
        />
      )}

      {segment === 'low' && inSegment.length > 0 && (
        <p className="mt-3 text-[13px] text-muted-foreground">
          En plus du SMS, un appel personnalisé est le plus efficace
        </p>
      )}

      {/* Liste */}
      {inSegment.length === 0 ? (
        <p className="mt-3 text-[13px] text-muted-foreground">Aucun établissement dans cette catégorie</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {inSegment.map(({ restaurant, activity, publishedToday, openToday }) => {
            const history = historyOf(restaurant.id);
            return (
              <li key={restaurant.id} className="rounded-md border border-border p-3 text-[13px]">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold text-foreground">{restaurant.name}</span>
                  <span className="shrink-0 text-xs font-semibold text-foreground">
                    {activity.publishedDays}/{activity.possibleDays} j
                  </span>
                </div>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${activity.rate * 100}%` }} />
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isWeekday && (
                    <span className={publishedToday ? 'font-semibold text-accent-strong' : ''}>
                      {!openToday
                        ? "Fermé aujourd'hui"
                        : publishedToday
                          ? "Publié aujourd'hui"
                          : "Pas encore publié aujourd'hui"}{' '}
                      ·{' '}
                    </span>
                  )}
                  {activity.lastPublished
                    ? `Dernière publication : ${activity.daysSinceLast === 0 ? "aujourd'hui" : `il y a ${activity.daysSinceLast} jour(s)`}`
                    : 'Aucune publication'}
                </p>

                {segment === 'low' && (
                  <a
                    href={`tel:${restaurant.ownerPhone}`}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground no-underline hover:bg-accent-strong"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Appeler le {formatPhone(restaurant.ownerPhone)}
                  </a>
                )}

                {history.length > 0 && (
                  <ul className="mt-2 space-y-0.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
                    {history.slice(0, 3).map((action) => (
                      <li key={action.id}>
                        {new Date(action.at).toLocaleDateString('fr-FR')} · {ACTION_LABELS[action.type] ?? 'SMS de rappel'}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
