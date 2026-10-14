import { useEffect, useState } from 'react';
import { useFieldArray, useForm, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Plus, X } from 'lucide-react';
import { parsePrice } from '@/utils/format';
import { errorClass, inputClass, primaryButton } from './ui';
import { ClosedDayRow, DayLabel, priceToInput, type WeekDay, type WeekFormProps } from './WeekForm';

// Formule « ardoise » : plusieurs plats par jour (nom + prix), pas d'entrées ni de desserts.
// Une ligne entièrement vide est ignorée à l'enregistrement
const itemSchema = z
  .object({
    name: z.string().trim(),
    price: z.string().trim(),
  })
  .superRefine(({ name, price }, ctx) => {
    if (!name && !price) return;
    if (name.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['name'], message: 'Indiquez le nom du plat' });
    } else if (name.length > 60) {
      ctx.addIssue({ code: 'custom', path: ['name'], message: '60 caractères maximum' });
    }
    const value = parsePrice(price);
    if (value === null || value > 80) {
      ctx.addIssue({ code: 'custom', path: ['price'], message: 'Prix invalide (ex. 9,50)' });
    }
  });

const menuSchema = z.object({ days: z.array(z.object({ items: z.array(itemSchema) })) });

type MenuValues = z.infer<typeof menuSchema>;
type ItemValues = MenuValues['days'][number]['items'][number];

const emptyItem = (): ItemValues => ({ name: '', price: '' });

const toValues = (days: WeekDay[]): MenuValues => ({
  days: days.map(({ items }) => ({
    items: items.length
      ? items.map((item) => ({ name: item.name, price: priceToInput(item.price) }))
      : [emptyItem()],
  })),
});

/** Saisie de la semaine pour la Formule : l'ardoise des plats du jour, plusieurs plats par jour. */
export default function MenuWeekForm({ days, suggestions, onSave }: WeekFormProps) {
  const [saved, setSaved] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<MenuValues>({ resolver: zodResolver(menuSchema), defaultValues: toValues(days) });

  const daysKey = JSON.stringify(days);
  useEffect(() => {
    reset(toValues(days));
  }, [daysKey]);

  useEffect(() => {
    if (isDirty) setSaved(false);
  }, [isDirty]);

  const submit = (values: MenuValues) => {
    onSave(
      days.flatMap((day, i) =>
        day.closed
          ? [] // jour fermé : rien à enregistrer
          : [
              {
                key: day.key,
                items: values.days[i].items
                  .filter((item) => item.name)
                  .map((item) => ({ name: item.name, price: parsePrice(item.price)! })),
              },
            ]
      )
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
          return (
            <li key={day.key} className="px-3 py-3">
              <DayLabel day={day} />
              <DayRows control={control} register={register} errors={errors} dayIndex={i} dayLabel={day.label} />
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-subtle">
        Vos plats restent en ligne jusqu'à 14h chaque jour, puis disparaissent automatiquement.
        Laissez un jour vide s'il n'y a pas de plat ce jour-là
      </p>

      <button type="submit" className={`${primaryButton} mt-4`}>
        {saved && !isDirty ? (
          <>
            <Check className="h-4 w-4" />
            Ardoise enregistrée
          </>
        ) : (
          'Valider'
        )}
      </button>
    </form>
  );
}

function DayRows({
  control,
  register,
  errors,
  dayIndex,
  dayLabel,
}: {
  control: Control<MenuValues>;
  register: UseFormRegister<MenuValues>;
  errors: FieldErrors<MenuValues>;
  dayIndex: number;
  dayLabel: string;
}) {
  const { fields, append, remove, replace } = useFieldArray({ control, name: `days.${dayIndex}.items` });
  const dayErrors = errors.days?.[dayIndex]?.items;

  return (
    <div className="space-y-2">
      {fields.map((field, j) => {
        const itemErrors = dayErrors?.[j];
        return (
          <div key={field.id}>
            <div className="grid grid-cols-[1fr_72px_28px] items-center gap-1.5">
              <input
                aria-label={`Plat ${j + 1}, ${dayLabel}`}
                placeholder={`Plat ${j + 1}`}
                list="recent-plats"
                autoComplete="off"
                aria-invalid={!!itemErrors?.name}
                className={inputClass}
                {...register(`days.${dayIndex}.items.${j}.name`)}
              />
              <input
                aria-label={`Prix du plat ${j + 1}, ${dayLabel}`}
                placeholder="Prix €"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={!!itemErrors?.price}
                className={`${inputClass} px-2`}
                {...register(`days.${dayIndex}.items.${j}.price`)}
              />
              <button
                type="button"
                onClick={() => (fields.length > 1 ? remove(j) : replace([emptyItem()]))}
                aria-label={`Supprimer le plat ${j + 1}, ${dayLabel}`}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-accent-strong"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {(itemErrors?.name || itemErrors?.price) && (
              <p role="alert" className={errorClass}>
                {itemErrors.name?.message ?? itemErrors.price?.message}
              </p>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => append(emptyItem())}
        className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-accent/50 py-2 text-[13px] font-medium text-accent hover:border-accent hover:bg-accent-soft"
      >
        <Plus className="h-4 w-4" />
        Ajouter un plat
      </button>
    </div>
  );
}
