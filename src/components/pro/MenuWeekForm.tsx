import { useEffect, useState } from 'react';
import { useFieldArray, useForm, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Check, LoaderCircle, Plus, Sparkles, X } from 'lucide-react';
import { scanMenuPhoto } from '@/lib/menuScan';
import { MENU_CATEGORIES, type MenuCategory } from '@/lib/plans';
import { parsePrice } from '@/utils/format';
import { errorClass, inputClass, primaryButton } from './ui';
import { ClosedDayRow, DayLabel, priceToInput, type WeekDay, type WeekFormProps } from './WeekForm';

// Une ligne entièrement vide est ignorée à l'enregistrement
const itemSchema = z
  .object({
    category: z.enum(MENU_CATEGORIES),
    name: z.string().trim(),
    price: z.string().trim(),
  })
  .superRefine(({ name, price }, ctx) => {
    if (!name && !price) return;
    if (name.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['name'], message: 'Indiquez le nom' });
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

const emptyItem = (): ItemValues => ({ category: 'Plat', name: '', price: '' });

const toValues = (days: WeekDay[]): MenuValues => ({
  days: days.map(({ items }) => ({
    items: items.length
      ? items.map((item) => ({
          category: item.category ?? 'Plat',
          name: item.name,
          price: priceToInput(item.price),
        }))
      : [emptyItem()],
  })),
});

export default function MenuWeekForm({
  days,
  suggestions,
  onSave,
  aiEnabled = false,
}: WeekFormProps & { aiEnabled?: boolean }) {
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
                  .map((item) => ({ category: item.category, name: item.name, price: parsePrice(item.price)! })),
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

      {aiEnabled && (
        <div className="mb-3 rounded-md border border-dashed border-accent/60 p-3 text-[13px] text-muted-foreground">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            Prenez votre ardoise en photo
          </p>
          <p className="mt-1">
            Touchez « Photo » sur un jour : l’IA remplit les lignes, vous vérifiez puis validez
          </p>
          <p className="mt-1 text-xs text-accent-strong">Démo : la lecture de la photo est simulée</p>
        </div>
      )}

      <ul className="divide-y divide-border rounded-md border border-border">
        {days.map((day, i) => {
          if (day.closed) return <ClosedDayRow key={day.key} day={day} />;
          return (
            <li key={day.key} className="px-3 py-3">
              <DayLabel day={day} />
              <DayRows
                control={control}
                register={register}
                errors={errors}
                dayIndex={i}
                dayLabel={day.label}
                aiEnabled={aiEnabled}
              />
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-subtle">
        Votre menu reste en ligne jusqu'à 14h chaque jour, puis disparaît automatiquement.
        Laissez un jour vide s'il n'y a pas de menu ce jour-là
      </p>

      <button type="submit" className={`${primaryButton} mt-4`}>
        {saved && !isDirty ? (
          <>
            <Check className="h-4 w-4" />
            Menu enregistré
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
  aiEnabled,
}: {
  control: Control<MenuValues>;
  register: UseFormRegister<MenuValues>;
  errors: FieldErrors<MenuValues>;
  dayIndex: number;
  dayLabel: string;
  aiEnabled: boolean;
}) {
  const { fields, append, remove, replace } = useFieldArray({ control, name: `days.${dayIndex}.items` });
  const dayErrors = errors.days?.[dayIndex]?.items;
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');

  const scanPhoto = async (file: File | undefined) => {
    if (!file) return;
    setScanState('scanning');
    const items = await scanMenuPhoto(file);
    replace(
      items.map((item) => ({
        category: item.category ?? 'Plat',
        name: item.name,
        price: priceToInput(item.price),
      }))
    );
    setScanState('done');
  };

  return (
    <div className="space-y-2">
      {scanState === 'scanning' && (
        <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin text-accent" />
          Lecture de la photo…
        </p>
      )}
      {scanState === 'done' && (
        <p className="text-[13px] text-accent-strong">
          Lignes remplies depuis la photo : vérifiez-les avant de valider
        </p>
      )}
      {fields.map((field, j) => {
        const itemErrors = dayErrors?.[j];
        return (
          <div key={field.id}>
            <div className="grid grid-cols-[104px_1fr_60px_28px] items-center gap-1.5">
              <select
                aria-label={`Catégorie, ligne ${j + 1}, ${dayLabel}`}
                className={`${inputClass} px-2`}
                {...register(`days.${dayIndex}.items.${j}.category`)}
              >
                {MENU_CATEGORIES.map((category: MenuCategory) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                aria-label={`Nom, ligne ${j + 1}, ${dayLabel}`}
                placeholder="Nom"
                list="recent-plats"
                autoComplete="off"
                aria-invalid={!!itemErrors?.name}
                className={`${inputClass} px-2`}
                {...register(`days.${dayIndex}.items.${j}.name`)}
              />
              <input
                aria-label={`Prix, ligne ${j + 1}, ${dayLabel}`}
                placeholder="€"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={!!itemErrors?.price}
                className={`${inputClass} px-2`}
                {...register(`days.${dayIndex}.items.${j}.price`)}
              />
              <button
                type="button"
                onClick={() => (fields.length > 1 ? remove(j) : replace([emptyItem()]))}
                aria-label={`Supprimer la ligne ${j + 1}, ${dayLabel}`}
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[13px] font-medium">
        <button
          type="button"
          onClick={() => append(emptyItem())}
          className="flex items-center gap-1 text-accent"
        >
          <Plus className="h-4 w-4" />
          Ajouter une ligne
        </button>
        {aiEnabled && (
          <label className="flex cursor-pointer items-center gap-1 text-accent">
            <Camera className="h-4 w-4" />
            Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              aria-label={`Prendre le menu en photo, ${dayLabel}`}
              onChange={(e) => {
                scanPhoto(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
