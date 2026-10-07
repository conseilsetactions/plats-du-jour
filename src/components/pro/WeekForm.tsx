import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from '@tanstack/react-router';
import { Check, X } from 'lucide-react';
import { formatPrice, parsePrice } from '@/utils/format';
import type { DayItem } from '@/lib/proStore';
import { errorClass, inputClass, primaryButton } from './ui';

// Un plat par jour : une ligne vide = pas de plat ce jour-là
const daySchema = z
  .object({ name: z.string().trim(), price: z.string().trim() })
  .superRefine(({ name, price }, ctx) => {
    if (!name && !price) return;
    if (name.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['name'], message: 'Indiquez le nom du plat' });
    } else if (name.length > 60) {
      ctx.addIssue({ code: 'custom', path: ['name'], message: '60 caractères maximum' });
    }
    const value = parsePrice(price);
    if (value === null || value > 50) {
      ctx.addIssue({ code: 'custom', path: ['price'], message: 'Prix invalide (ex. 9,50)' });
    }
  });

const weekSchema = z.object({ days: z.array(daySchema) });

type WeekValues = z.infer<typeof weekSchema>;

export interface WeekDay {
  key: string; // AAAA-MM-JJ
  label: string;
  isToday: boolean;
  closed: boolean; // jour de fermeture de l'établissement : rien à saisir
  items: DayItem[];
}

/** Ligne d'un jour fermé : grisée, avec un lien vers la configuration de l'établissement. */
export function ClosedDayRow({ day }: { day: WeekDay }) {
  return (
    <li className="flex items-center justify-between gap-3 bg-muted px-3 py-3">
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wide text-subtle">{day.label}</span>
        <span className="flex items-center gap-1 text-sm font-semibold text-closed">
          <X className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
          Fermé
        </span>
      </span>
      {/* Propriétaire et membres de l'équipe peuvent modifier les jours d'ouverture */}
      <Link
        to="/pro/etablissement"
        search={{ retour: 'espace' }}
        className="text-xs font-semibold text-accent no-underline"
      >
        Modifier
      </Link>
    </li>
  );
}

/** Titre d'un jour ouvert, avec la pastille « Aujourd'hui ». */
export function DayLabel({ day }: { day: WeekDay }) {
  return (
    <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-subtle">
      {day.label}
      {day.isToday && (
        <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">Aujourd'hui</span>
      )}
    </p>
  );
}

export interface WeekFormProps {
  days: WeekDay[];
  suggestions: string[]; // noms de plats récents, proposés à la saisie
  onSave: (entries: { key: string; items: DayItem[] }[]) => void;
}

/** 9.5 -> "9,50" pour réafficher un prix dans un champ */
export const priceToInput = (price: number) => formatPrice(price).replace('€', '');

const toValues = (days: WeekDay[]): WeekValues => ({
  days: days.map(({ items }) => ({
    name: items[0]?.name ?? '',
    price: items[0] ? priceToInput(items[0].price) : '',
  })),
});

export default function WeekForm({ days, suggestions, onSave }: WeekFormProps) {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<WeekValues>({ resolver: zodResolver(weekSchema), defaultValues: toValues(days) });

  // Nouveau jour (ou plats modifiés ailleurs) : on recharge le formulaire
  const daysKey = JSON.stringify(days);
  useEffect(() => {
    reset(toValues(days));
  }, [daysKey]);

  useEffect(() => {
    if (isDirty) setSaved(false);
  }, [isDirty]);

  const submit = (values: WeekValues) => {
    onSave(
      days.flatMap((day, i) => {
        if (day.closed) return []; // jour fermé : rien à enregistrer
        const { name, price } = values.days[i];
        return [{ key: day.key, items: name ? [{ name, price: parsePrice(price)! }] : [] }];
      })
    );
    setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <datalist id="recent-plats">
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <ul className="divide-y divide-border rounded-md border border-border">
        {days.map((day, i) => {
          if (day.closed) return <ClosedDayRow key={day.key} day={day} />;
          const dayErrors = errors.days?.[i];
          return (
            <li key={day.key} className="px-3 py-3">
              <DayLabel day={day} />
              <div className="grid grid-cols-[1fr_84px] gap-2">
                <input
                  aria-label={`Plat du ${day.label}`}
                  placeholder="Nom du plat"
                  list="recent-plats"
                  autoComplete="off"
                  aria-invalid={!!dayErrors?.name}
                  className={inputClass}
                  {...register(`days.${i}.name`)}
                />
                <input
                  aria-label={`Prix du ${day.label}`}
                  placeholder="Prix €"
                  inputMode="decimal"
                  autoComplete="off"
                  aria-invalid={!!dayErrors?.price}
                  className={inputClass}
                  {...register(`days.${i}.price`)}
                />
              </div>
              {(dayErrors?.name || dayErrors?.price) && (
                <p role="alert" className={errorClass}>
                  {dayErrors.name?.message ?? dayErrors.price?.message}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-subtle">
        Vos plats restent en ligne jusqu'à 14h chaque jour, puis disparaissent automatiquement.
        Laissez une ligne vide s'il n'y a pas de plat ce jour-là
      </p>

      <button type="submit" className={`${primaryButton} mt-4`}>
        {saved && !isDirty ? (
          <>
            <Check className="h-4 w-4" />
            Plats enregistrés
          </>
        ) : (
          'Valider'
        )}
      </button>
    </form>
  );
}
