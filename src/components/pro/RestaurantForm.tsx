import { useEffect, useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BadgeCheck, Check, LoaderCircle, X } from 'lucide-react';
import { geocodeAddress, proStore, type RestaurantProfile } from '@/lib/proStore';
import { lookupSiret, TEST_SIRETS, type SiretInfo } from '@/lib/siret';
import { DEFAULT_OPEN_DAYS, getOpenDays, WEEKDAYS } from '@/lib/openDays';
import {
  calculateDistance,
  CITIES,
  CITY_NAMES,
  DEFAULT_CITY,
  getQuartierCenter,
  getQuartiers,
  isCity,
  type City,
} from '@/utils/mockData';
import { errorClass, inputClass, labelClass, primaryButton, secondaryButton } from './ui';
import { DEMO_MODE } from '@/lib/demo';

const CERTIFICATION =
  'Je certifie être le propriétaire ou le représentant légal de cet établissement, ou être dûment autorisé(e) à le représenter';

/** Événement envoyé par le module de démo pour tester un SIRET fictif. */
export const DEMO_SIRET_EVENT = 'pdj:demo-siret';

const detailsSchema = z.object({
  name: z.string().trim().min(2, 'Indiquez le nom du restaurant').max(60, '60 caractères maximum'),
  city: z.string().min(1, 'Choisissez une ville'),
  quartier: z.string().min(1, 'Choisissez un quartier'),
  openDays: z.array(z.string()).min(1, "Choisissez au moins un jour d'ouverture"),
  certified: z.boolean(),
});

type DetailsValues = z.infer<typeof detailsSchema>;

/** Valeurs du formulaire -> jours d'ouverture triés (1 = lundi … 5 = vendredi). */
const toOpenDays = (values: string[]) => values.map(Number).sort((a, b) => a - b);

/** Quartier dont le centre est le plus proche du restaurant. */
const nearestQuartier = (city: City, info: SiretInfo) => {
  if (!info.location) return '';
  return getQuartiers(city)
    .map((q) => ({ q, d: calculateDistance(info.location!, getQuartierCenter(city, q)!) }))
    .sort((a, b) => a.d - b.d)[0]?.q ?? '';
};

function AddressCard({ name, siret, street, postalCode, city }: { name: string; siret: string; street: string; postalCode: string; city: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3 text-sm">
      <p className="flex items-center gap-1.5 font-semibold text-foreground">
        <BadgeCheck className="h-4 w-4 text-accent" />
        {name}
      </p>
      <p className="mt-1 text-muted-foreground">
        {street}, {postalCode} {city}
      </p>
      <p className="mt-1 text-xs text-subtle">SIRET {siret} · vérifié</p>
    </div>
  );
}

/** Les 5 jours (lun-ven), chacun ouvert (coche verte) ou fermé (croix rouge). */
function OpenDaysGrid({
  checkedDays,
  inputProps,
  error,
}: {
  checkedDays: string[];
  inputProps: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <>
      <div className="grid grid-cols-5 gap-1.5">
        {WEEKDAYS.map(({ day, short, long }) => {
          const open = checkedDays.includes(String(day));
          return (
            <label
              key={day}
              className={`flex cursor-pointer flex-col items-center gap-0.5 rounded-md border py-2 transition-colors ${
                open ? 'border-open bg-open-soft text-open' : 'border-closed/50 bg-closed-soft text-closed'
              }`}
            >
              <input
                type="checkbox"
                value={String(day)}
                aria-label={`${long} : ${open ? 'ouvert' : 'fermé'}`}
                className="sr-only"
                {...inputProps}
              />
              <span className="text-sm font-semibold text-foreground">{short}</span>
              {open ? (
                <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
              ) : (
                <X className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
              )}
              <span className="text-[10px] font-semibold uppercase">{open ? 'Ouvert' : 'Fermé'}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p className={errorClass}>{error}</p>
      ) : (
        <p className="mt-1 text-xs text-subtle">
          Touchez un jour pour passer d'ouvert à fermé. Les jours fermés, vous n'avez pas de plat à saisir
          et ne recevez pas de rappel. Modifiable à tout moment
        </p>
      )}
    </>
  );
}

const openDaysSchema = z.object({
  openDays: z.array(z.string()).min(1, "Choisissez au moins un jour d'ouverture"),
});

/** Jours d'ouverture seuls : ce que les membres de l'équipe peuvent modifier. */
export function OpenDaysForm({
  restaurant,
  onDone,
  onCancel,
}: {
  restaurant: RestaurantProfile;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof openDaysSchema>>({
    resolver: zodResolver(openDaysSchema),
    defaultValues: { openDays: getOpenDays(restaurant).map(String) },
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit(({ openDays }) => {
        proStore.updateRestaurant({ openDays: toOpenDays(openDays) });
        onDone();
      })}
    >
      <fieldset>
        <legend className={labelClass}>Jours d'ouverture le midi</legend>
        <OpenDaysGrid checkedDays={watch('openDays') ?? []} inputProps={register('openDays')} error={errors.openDays?.message} />
      </fieldset>
      <div className="flex gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className={`${secondaryButton} flex-1`}>
            Annuler
          </button>
        )}
        <button type="submit" className={`${primaryButton} flex-1`}>
          Enregistrer
        </button>
      </div>
    </form>
  );
}

function DetailsFields({
  defaults,
  requireCertification,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  defaults: { name: string; city: string; quartier: string; openDays: number[] };
  requireCertification: boolean;
  submitLabel: string;
  onSubmit: (values: DetailsValues) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { ...defaults, openDays: defaults.openDays.map(String), certified: false },
  });
  const checkedDays = watch('openDays') ?? [];
  const watchedCity = watch('city');
  const city: City = isCity(watchedCity) ? watchedCity : DEFAULT_CITY;

  const submit = async (values: DetailsValues) => {
    if (requireCertification && !values.certified) {
      setError('certified', { message: 'Cette certification est obligatoire' });
      return;
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="resto-name" className={labelClass}>
          Nom affiché aux clients
        </label>
        <input id="resto-name" aria-invalid={!!errors.name} className={inputClass} {...register('name')} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="resto-city" className={labelClass}>
          Ville
        </label>
        <select
          id="resto-city"
          aria-invalid={!!errors.city}
          className={inputClass}
          {...register('city', {
            // Nouvelle ville : le quartier est à choisir à nouveau
            onChange: () => setValue('quartier', ''),
          })}
        >
          {CITY_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {errors.city && <p className={errorClass}>{errors.city.message}</p>}
      </div>

      <div>
        <label htmlFor="resto-quartier" className={labelClass}>
          Quartier
        </label>
        <select id="resto-quartier" aria-invalid={!!errors.quartier} className={inputClass} {...register('quartier')}>
          <option value="" disabled>
            Choisir…
          </option>
          {getQuartiers(city).map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
        {errors.quartier && <p className={errorClass}>{errors.quartier.message}</p>}
      </div>

      <fieldset>
        <legend className={labelClass}>Jours d'ouverture le midi</legend>
        <OpenDaysGrid checkedDays={checkedDays} inputProps={register('openDays')} error={errors.openDays?.message} />
      </fieldset>

      {requireCertification && (
        <div>
          <label className="flex items-start gap-2.5 text-[13px] leading-snug text-foreground">
            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#d97757]" {...register('certified')} />
            {CERTIFICATION}
          </label>
          {errors.certified && <p className={errorClass}>{errors.certified.message}</p>}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className={`${secondaryButton} flex-1`}>
            Annuler
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className={`${primaryButton} flex-1`}>
          {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

/** Création d'un restaurant : SIRET vérifié, puis nom, quartier et certification. */
export function CreateRestaurantForm() {
  const [siret, setSiret] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<SiretInfo | null>(null);

  // Démo : le module en bas à gauche remplit et vérifie un SIRET de test
  useEffect(() => {
    if (!DEMO_MODE) return;
    const onDemoSiret = (e: Event) => {
      const value = (e as CustomEvent<string>).detail;
      setSiret(value);
      verify(value);
    };
    window.addEventListener(DEMO_SIRET_EVENT, onDemoSiret);
    return () => window.removeEventListener(DEMO_SIRET_EVENT, onDemoSiret);
  }, []);

  const verify = async (value = siret) => {
    setError(null);
    setChecking(true);
    const result = await lookupSiret(value);
    setChecking(false);
    if (!result.ok) return setError(result.error);

    const { info: found } = result;
    if (!isCity(found.city) || !CITIES[found.city].postalCode.test(found.postalCode)) {
      return setError(`Plats du Jour n'est pas encore disponible à ${found.city}`);
    }
    if (proStore.isSiretTaken(found.siret)) {
      return setError(
        'Cet établissement a déjà un compte. Demandez à son propriétaire de vous ajouter à son équipe'
      );
    }
    setInfo(found);
  };

  if (!info || !isCity(info.city)) {
    return (
      <div className="space-y-3">
        <div>
          <label htmlFor="resto-siret" className={labelClass}>
            Numéro SIRET de votre établissement
          </label>
          <div className="flex gap-2">
            <input
              id="resto-siret"
              inputMode="numeric"
              placeholder="14 chiffres"
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
              aria-invalid={!!error}
              className={inputClass}
            />
            <button type="button" onClick={() => verify()} disabled={checking} className={`${secondaryButton} shrink-0`}>
              {checking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Vérifier'}
            </button>
          </div>
          {error && (
            <p role="alert" className={errorClass}>
              {error}
            </p>
          )}
        </div>
        <p className="text-xs text-subtle">
          Le SIRET permet de vérifier que votre établissement existe et de remplir son adresse
          automatiquement. Vous le trouverez sur vos factures ou sur{' '}
          <a
            href="https://annuaire-entreprises.data.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline"
          >
            l'Annuaire des entreprises
          </a>
          .
        </p>

        {DEMO_MODE && (
          <div className="rounded-md border border-dashed border-accent/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Démo</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Touchez un établissement fictif pour tester :
            </p>
            <div className="mt-2 space-y-1.5">
              {TEST_SIRETS.map((test) => (
                <button
                  key={test.siret}
                  type="button"
                  onClick={() => {
                    setSiret(test.siret);
                    verify(test.siret);
                  }}
                  className="block w-full rounded-md border border-input bg-card px-3 py-2 text-left text-[13px] hover:border-accent"
                >
                  <span className="font-medium text-foreground">{test.name}</span>
                  <span className="block text-xs text-subtle">SIRET {test.siret}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Ville pré-remplie : celle du SIRET si elle est couverte, sinon Marseille
  const defaultCity: City = isCity(info.city) ? info.city : DEFAULT_CITY;

  return (
    <div className="space-y-4">
      <AddressCard {...info} />
      <DetailsFields
        defaults={{
          name: info.name,
          city: defaultCity,
          quartier: nearestQuartier(defaultCity, info),
          openDays: DEFAULT_OPEN_DAYS,
        }}
        requireCertification
        submitLabel="Continuer"
        onCancel={() => setInfo(null)}
        onSubmit={async ({ name, city: chosenCity, quartier, openDays }) => {
          const city = chosenCity as City;
          const location =
            info.location ??
            (await geocodeAddress(info.street, info.postalCode, city)) ??
            getQuartierCenter(city, quartier)!;
          proStore.createRestaurant({
            siret: info.siret,
            name,
            street: info.street,
            postalCode: info.postalCode,
            city,
            quartier,
            openDays: toOpenDays(openDays),
            location,
            certifiedAt: new Date().toISOString(),
          });
        }}
      />
    </div>
  );
}

/** Modification (propriétaire) : nom, ville, quartier et jours d'ouverture ; l'adresse vient du SIRET. */
export function EditRestaurantForm({
  restaurant,
  onDone,
  onCancel,
}: {
  restaurant: RestaurantProfile;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const city: City = isCity(restaurant.city) ? restaurant.city : 'Marseille';
  return (
    <div className="space-y-4">
      <AddressCard {...restaurant} />
      <DetailsFields
        defaults={{ name: restaurant.name, city, quartier: restaurant.quartier, openDays: getOpenDays(restaurant) }}
        requireCertification={false}
        submitLabel="Enregistrer"
        onCancel={onCancel}
        onSubmit={({ name, city: chosenCity, quartier, openDays }) => {
          proStore.updateRestaurant({ name, city: chosenCity, quartier, openDays: toOpenDays(openDays) });
          onDone();
        }}
      />
    </div>
  );
}
