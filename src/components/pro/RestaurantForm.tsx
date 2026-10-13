import { useEffect, useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ExternalLink, LoaderCircle, MapPin, Search, Star, X } from 'lucide-react';
import { proStore, type RestaurantProfile } from '@/lib/proStore';
import { DEMO_PLACES, searchPlaces, type PlaceInfo } from '@/lib/places';
import { DEFAULT_OPEN_DAYS, getOpenDays, WEEKDAYS } from '@/lib/openDays';
import { calculateDistance, CITIES, CITY_NAMES, getQuartierCenter, getQuartiers, isCity, type City } from '@/utils/mockData';
import { formatRating } from '@/utils/format';
import { errorClass, inputClass, labelClass, primaryButton, secondaryButton } from './ui';
import { DEMO_MODE } from '@/lib/demo';

const CERTIFICATION =
  'Je certifie être le propriétaire ou le représentant légal de cet établissement, ou être dûment autorisé(e) à le représenter';

/** Événement envoyé par le module de démo pour choisir un établissement fictif. */
export const DEMO_PLACE_EVENT = 'pdj:demo-place';

const detailsSchema = z.object({
  name: z.string().trim().min(2, "Indiquez le nom de l'établissement").max(60, '60 caractères maximum'),
  street: z.string().trim().min(4, "Indiquez l'adresse"),
  postalCode: z.string().trim().regex(/^\d{5}$/, 'Code postal invalide'),
  city: z.string().min(1, 'Choisissez une ville'),
  openDays: z.array(z.string()).min(1, "Choisissez au moins un jour d'ouverture"),
  certified: z.boolean(),
});

type DetailsValues = z.infer<typeof detailsSchema>;

/** Valeurs du formulaire -> jours d'ouverture triés (1 = lundi … 5 = vendredi). */
const toOpenDays = (values: string[]) => values.map(Number).sort((a, b) => a - b);

/** Quartier dont le centre est le plus proche de la position Google de l'établissement. */
const nearestQuartier = (city: City, location: { latitude: number; longitude: number }) =>
  getQuartiers(city)
    .map((q) => ({ q, d: calculateDistance(location, getQuartierCenter(city, q)!) }))
    .sort((a, b) => a.d - b.d)[0]?.q ?? '';

/** Ce qui vient de Google (non modifiable) : note, nombre d'avis, position et lien vers la fiche. */
function GoogleInfo({ rating, ratingCount, mapsUrl }: { rating?: number; ratingCount?: number; mapsUrl?: string }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-subtle">
      {rating !== undefined && (
        <span className="flex items-center gap-0.5">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
          {formatRating(rating)}
          {ratingCount !== undefined && ` (${ratingCount} avis)`} sur Google
        </span>
      )}
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-accent">
          Fiche Google
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </p>
  );
}

/** Une fiche trouvée sur Google : nom, adresse, note. */
function PlaceCard({ place }: { place: PlaceInfo }) {
  return (
    <span className="block">
      <span className="block text-sm font-semibold text-foreground">{place.name}</span>
      <span className="mt-0.5 flex items-start gap-1 text-[13px] text-muted-foreground">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {place.street}, {place.postalCode} {place.city}
      </span>
      <span className="mt-1 block">
        <GoogleInfo rating={place.rating} ratingCount={place.ratingCount} />
      </span>
    </span>
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

/**
 * Nom et adresse (modifiables), jours d'ouverture, certification.
 * La note, la position et le quartier restent ceux de Google.
 */
function DetailsFields({
  defaults,
  location,
  google,
  requireCertification,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  defaults: { name: string; street: string; postalCode: string; city: string; openDays: number[] };
  location: { latitude: number; longitude: number };
  google: { rating?: number; ratingCount?: number; mapsUrl?: string };
  requireCertification: boolean;
  submitLabel: string;
  onSubmit: (values: DetailsValues & { quartier: string }) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { ...defaults, openDays: defaults.openDays.map(String), certified: false },
  });
  const checkedDays = watch('openDays') ?? [];
  const watchedCity = watch('city');
  const quartier = isCity(watchedCity) ? nearestQuartier(watchedCity, location) : '';

  const submit = async (values: DetailsValues) => {
    if (requireCertification && !values.certified) {
      setError('certified', { message: 'Cette certification est obligatoire' });
      return;
    }
    await onSubmit({ ...values, quartier });
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
        <label htmlFor="resto-street" className={labelClass}>
          Adresse
        </label>
        <input id="resto-street" aria-invalid={!!errors.street} className={inputClass} {...register('street')} />
        {errors.street && <p className={errorClass}>{errors.street.message}</p>}
      </div>
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <div>
          <label htmlFor="resto-postal" className={labelClass}>
            Code postal
          </label>
          <input
            id="resto-postal"
            inputMode="numeric"
            maxLength={5}
            aria-invalid={!!errors.postalCode}
            className={inputClass}
            {...register('postalCode')}
          />
        </div>
        <div>
          <label htmlFor="resto-city" className={labelClass}>
            Ville
          </label>
          <select id="resto-city" aria-invalid={!!errors.city} className={inputClass} {...register('city')}>
            {CITY_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {(errors.postalCode || errors.city) && (
        <p className={errorClass}>{errors.postalCode?.message ?? errors.city?.message}</p>
      )}

      {/* Repris de Google, non modifiable */}
      <div className="rounded-md bg-muted px-3 py-2.5 text-[13px]">
        <p className="text-foreground">
          Quartier : <span className="font-semibold">{quartier || '—'}</span>
        </p>
        <div className="mt-1">
          <GoogleInfo {...google} />
        </div>
        <p className="mt-1 text-xs text-subtle">
          La note et la position viennent de votre fiche Google, elles ne se modifient pas ici
        </p>
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

/**
 * Création de l'établissement, sans SIRET :
 * 1. le pro cherche son établissement sur Google ;
 * 2. « Est-ce bien votre établissement ? » ;
 * 3. nom et adresse (modifiables), jours d'ouverture, certification.
 */
export function CreateRestaurantForm() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceInfo[] | null>(null);
  const [candidate, setCandidate] = useState<PlaceInfo | null>(null); // « Est-ce bien vous ? »
  const [confirmed, setConfirmed] = useState<PlaceInfo | null>(null);

  /** Établissement choisi : zone couverte et pas déjà inscrit ? */
  const choose = (place: PlaceInfo) => {
    setError(null);
    if (!isCity(place.city) || !CITIES[place.city].postalCode.test(place.postalCode)) {
      setError(`Plats du Jour n'est pas encore disponible à ${place.city || 'cet endroit'}`);
      return;
    }
    if (proStore.isPlaceTaken(place.placeId)) {
      setError('Cet établissement a déjà un compte. Demandez à son propriétaire de vous ajouter à son équipe');
      return;
    }
    setCandidate(place);
  };

  // Démo : le module en bas à gauche choisit directement un établissement fictif
  useEffect(() => {
    if (!DEMO_MODE) return;
    const onDemoPlace = (e: Event) => {
      const place = DEMO_PLACES.find((p) => p.placeId === (e as CustomEvent<string>).detail);
      if (place) {
        setConfirmed(null);
        choose(place);
      }
    };
    window.addEventListener(DEMO_PLACE_EVENT, onDemoPlace);
    return () => window.removeEventListener(DEMO_PLACE_EVENT, onDemoPlace);
  }, []);

  const search = async () => {
    setError(null);
    setSearching(true);
    const result = await searchPlaces(query);
    setSearching(false);
    if (!result.ok) return setError(result.error);
    setResults(result.places);
  };

  // 3. Détails
  if (confirmed && isCity(confirmed.city)) {
    return (
      <DetailsFields
        defaults={{
          name: confirmed.name.replace(/\s*\(test[^)]*\)$/, ''),
          street: confirmed.street,
          postalCode: confirmed.postalCode,
          city: confirmed.city,
          openDays: DEFAULT_OPEN_DAYS,
        }}
        location={confirmed.location}
        google={confirmed}
        requireCertification
        submitLabel="Continuer"
        onCancel={() => setConfirmed(null)}
        onSubmit={({ name, street, postalCode, city, quartier, openDays }) => {
          proStore.createRestaurant({
            googlePlaceId: confirmed.placeId,
            rating: confirmed.rating,
            ratingCount: confirmed.ratingCount,
            mapsUrl: confirmed.mapsUrl,
            name,
            street,
            postalCode,
            city,
            quartier,
            openDays: toOpenDays(openDays),
            location: confirmed.location,
            certifiedAt: new Date().toISOString(),
          });
        }}
      />
    );
  }

  // 2. « Est-ce bien votre établissement ? »
  if (candidate) {
    return (
      <div className="space-y-4">
        <p className="text-base font-semibold text-foreground">Est-ce bien votre établissement ?</p>
        <div className="rounded-md border border-accent bg-accent-soft p-4">
          <PlaceCard place={candidate} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCandidate(null)} className={`${secondaryButton} flex-1`}>
            Non, chercher à nouveau
          </button>
          <button
            onClick={() => {
              setConfirmed(candidate);
              setCandidate(null);
            }}
            className={`${primaryButton} flex-1`}
          >
            Oui, c'est bien moi
          </button>
        </div>
      </div>
    );
  }

  // 1. Recherche sur Google
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="resto-search" className={labelClass}>
          Trouvez votre établissement sur Google Maps
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              id="resto-search"
              type="search"
              placeholder="Nom de votre établissement"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              aria-invalid={!!error}
              className={`${inputClass} pl-8`}
            />
          </div>
          <button type="button" onClick={search} disabled={searching} className={`${secondaryButton} shrink-0`}>
            {searching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Rechercher'}
          </button>
        </div>
        {error && (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        )}
        <p className="mt-1 text-xs text-subtle">Astuce : ajoutez le nom de la rue si plusieurs établissements portent le même nom</p>
      </div>

      {results && (
        results.length === 0 ? (
          <p className="rounded-md bg-muted p-3 text-[13px] text-muted-foreground">
            Aucun établissement trouvé. Vérifiez l'orthographe, ou ajoutez le nom de la rue
          </p>
        ) : (
          <ul className="space-y-2" aria-label="Établissements trouvés">
            {results.map((place) => (
              <li key={place.placeId}>
                <button
                  type="button"
                  onClick={() => choose(place)}
                  className="w-full rounded-md border border-input bg-card p-3 text-left transition-colors hover:border-accent"
                >
                  <PlaceCard place={place} />
                </button>
              </li>
            ))}
          </ul>
        )
      )}

      {DEMO_MODE && (
        <p className="rounded-md border border-dashed border-accent/60 p-3 text-[13px] text-muted-foreground">
          <span className="font-semibold text-accent-strong">Démo :</span> tapez par exemple « Paulette », « Liban » ou
          « test » pour trouver un établissement fictif
        </p>
      )}
    </div>
  );
}

/** Modification (propriétaire) : nom, adresse et jours d'ouverture ; note, position et quartier restent ceux de Google. */
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
    <DetailsFields
      defaults={{
        name: restaurant.name,
        street: restaurant.street,
        postalCode: restaurant.postalCode,
        city,
        openDays: getOpenDays(restaurant),
      }}
      location={restaurant.location}
      google={restaurant}
      requireCertification={false}
      submitLabel="Enregistrer"
      onCancel={onCancel}
      onSubmit={({ name, street, postalCode, city: chosenCity, quartier, openDays }) => {
        proStore.updateRestaurant({ name, street, postalCode, city: chosenCity, quartier, openDays: toOpenDays(openDays) });
        onDone();
      }}
    />
  );
}
